/* ===========================================================
 * CLÍNICA VIDAMAR · Chatbot "Mar"
 * Asistente IA con flujo conversacional de agendamiento
 * Demo front-end. En producción se conecta a backend con Claude
 * + WhatsApp API (Whapi/Meta) + integración Imed / Medipass.
 * =========================================================== */

const chatbotEl = document.getElementById('chatbot');
const chatbotFab = document.getElementById('chatbotFab');
const chatbotClose = document.getElementById('chatbotClose');
const chatBody = document.getElementById('chatBody');
const chatQuick = document.getElementById('chatQuick');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

const openChatButtons = document.querySelectorAll('#openChatHero, #openChatAsk');

function openChat() {
  chatbotEl.classList.add('is-open');
  if (!chatBody.hasChildNodes()) initConversation();
  setTimeout(() => chatInput.focus(), 300);
}
function closeChat() {
  chatbotEl.classList.remove('is-open');
}

chatbotFab?.addEventListener('click', openChat);
chatbotClose?.addEventListener('click', closeChat);
openChatButtons.forEach(b => b?.addEventListener('click', (e) => { e.preventDefault(); openChat(); }));

/* Esc para cerrar */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chatbotEl.classList.contains('is-open')) closeChat();
});

/* ---------- Flujo conversacional ---------- */
const state = {
  step: 'welcome',
  specialty: null,
  doctor: null,
  date: null,
  time: null,
  payment: null,
  name: null,
  rut: null,
  phone: null
};

const FLOW = {
  welcome: {
    bot: '¡Hola! 👋 Soy <strong>Mar</strong>, tu asistente de Clínica Vidamar. Puedo ayudarte a agendar tu hora médica, responder dudas sobre FONASA/ISAPRE o derivarte con un humano.\n\n¿En qué te puedo ayudar hoy?',
    quick: [
      { label: 'Agendar una hora 🗓️', next: 'chooseSpecialty' },
      { label: '¿Atienden FONASA?', next: 'fonasa' },
      { label: 'Horarios y ubicación', next: 'info' },
      { label: 'Hablar con humano', next: 'human' }
    ]
  },
  chooseSpecialty: {
    bot: '¡Perfecto! Dime, ¿para qué especialidad necesitas la hora?',
    quick: [
      { label: 'Medicina General', value: 'Medicina General Adultos', next: 'chooseDoctor' },
      { label: 'Pediatría 👶', value: 'Pediatría', next: 'chooseDoctor' },
      { label: 'Kinesiología', value: 'Kinesiología', next: 'chooseDoctor' },
      { label: 'Ginecología', value: 'Ginecología', next: 'chooseDoctor' },
      { label: 'Nutrición', value: 'Nutrición', next: 'chooseDoctor' },
      { label: 'Psicología', value: 'Psicología', next: 'chooseDoctor' }
    ],
    onChoice: (opt) => { state.specialty = opt.value; }
  },
  chooseDoctor: {
    bot: () => {
      const docs = DOCTORS.filter(d => d.specialty === state.specialty);
      if (!docs.length) return `Por ahora no tenemos profesionales de <strong>${state.specialty}</strong> disponibles online. ¿Quieres que te contacte una enfermera?`;
      return `Tenemos ${docs.length} profesional${docs.length > 1 ? 'es' : ''} disponibles para <strong>${state.specialty}</strong>. ¿Con quién prefieres atenderte?`;
    },
    quick: () => {
      const docs = DOCTORS.filter(d => d.specialty === state.specialty);
      return docs.map(d => ({ label: d.name, value: d.id, next: 'chooseDate' }));
    },
    onChoice: (opt) => { state.doctor = DOCTORS.find(d => d.id === opt.value); }
  },
  chooseDate: {
    bot: () => `Excelente elección ✨ ${state.doctor.name} tiene horas disponibles esta semana. ¿Cuándo te acomoda venir?`,
    quick: [
      { label: 'Mañana en la mañana', value: 'mañana-am', next: 'chooseTime' },
      { label: 'Mañana en la tarde', value: 'mañana-pm', next: 'chooseTime' },
      { label: 'Esta semana', value: 'semana', next: 'chooseTime' },
      { label: 'Próxima semana', value: 'proxima', next: 'chooseTime' }
    ],
    onChoice: (opt) => {
      const today = new Date();
      const opts = {
        'mañana-am': new Date(today.setDate(today.getDate() + 1)),
        'mañana-pm': new Date(today.setDate(today.getDate() + 1)),
        'semana': new Date(today.setDate(today.getDate() + 3)),
        'proxima': new Date(today.setDate(today.getDate() + 8))
      };
      state.date = opts[opt.value].toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    }
  },
  chooseTime: {
    bot: () => `Perfecto, <strong>${state.date}</strong>. ¿Qué horario prefieres?`,
    quick: [
      { label: '09:00', value: '09:00', next: 'choosePayment' },
      { label: '10:30', value: '10:30', next: 'choosePayment' },
      { label: '11:30', value: '11:30', next: 'choosePayment' },
      { label: '15:00', value: '15:00', next: 'choosePayment' },
      { label: '16:00', value: '16:00', next: 'choosePayment' }
    ],
    onChoice: (opt) => { state.time = opt.value; }
  },
  choosePayment: {
    bot: () => {
      const prices = state.doctor.price;
      return `Tu hora es: ${state.date} a las ${state.time} con ${state.doctor.name}. ¿Cómo prefieres pagar?\n\n💙 <strong>FONASA</strong>: $${prices.FONASA.toLocaleString('es-CL')} (bono electrónico)\n💚 <strong>ISAPRE</strong>: $${prices.ISAPRE.toLocaleString('es-CL')} (copago estimado)\n🧡 <strong>Particular</strong>: $${prices.Particular.toLocaleString('es-CL')} (Webpay)`;
    },
    quick: [
      { label: '💙 FONASA', value: 'FONASA', next: 'askName' },
      { label: '💚 ISAPRE', value: 'ISAPRE', next: 'askName' },
      { label: '🧡 Particular', value: 'Particular', next: 'askName' }
    ],
    onChoice: (opt) => { state.payment = opt.value; }
  },
  askName: {
    bot: 'Genial. Para reservar la hora y emitir el bono, necesito algunos datos.\n\n¿Cuál es tu <strong>nombre completo</strong>?',
    free: true,
    onInput: (v) => { state.name = v; return 'askRut'; }
  },
  askRut: {
    bot: () => `Mucho gusto, ${state.name.split(' ')[0]} 🌊. ¿Me dices tu <strong>RUT</strong>? (formato 12.345.678-9)`,
    free: true,
    onInput: (v) => { state.rut = v; return 'askPhone'; }
  },
  askPhone: {
    bot: 'Perfecto. Por último, ¿cuál es tu <strong>número de celular</strong>? Ahí te mandaré la confirmación por WhatsApp.',
    free: true,
    onInput: (v) => { state.phone = v; return 'confirm'; }
  },
  confirm: {
    bot: () => {
      const total = state.doctor.price[state.payment];
      return `
<strong>📋 Resumen de tu hora:</strong>

• <strong>Paciente:</strong> ${state.name}
• <strong>RUT:</strong> ${state.rut}
• <strong>Especialidad:</strong> ${state.specialty}
• <strong>Profesional:</strong> ${state.doctor.name}
• <strong>Fecha:</strong> ${state.date} · ${state.time}
• <strong>Previsión:</strong> ${state.payment}
• <strong>Total:</strong> $${total.toLocaleString('es-CL')}

¿Confirmas tu reserva?`;
    },
    quick: [
      { label: '✅ Sí, confirmar', next: 'processing' },
      { label: '✏️ Editar', next: 'chooseSpecialty' }
    ]
  },
  processing: {
    bot: 'Procesando tu reserva e integrando con Imed (bono electrónico)… 🔐',
    auto: () => {
      setTimeout(() => pushStep('success'), 2200);
    }
  },
  success: {
    bot: () => `
✅ <strong>¡Hora confirmada!</strong>

Te enviamos la confirmación por WhatsApp a <strong>${state.phone}</strong>.

${state.payment === 'FONASA' ? '💙 Tu bono electrónico FONASA fue emitido. Llega 15 min antes con tu cédula.' : ''}
${state.payment === 'ISAPRE' ? '💚 Tu copago quedó pre-autorizado con tu ISAPRE.' : ''}
${state.payment === 'Particular' ? '🧡 Recibirás el link de Webpay en tu WhatsApp.' : ''}

¿Te puedo ayudar con algo más?`,
    quick: [
      { label: 'Agendar otra hora', next: 'chooseSpecialty' },
      { label: 'Cómo llegar', next: 'info' },
      { label: 'No, gracias 🙏', next: 'bye' }
    ]
  },
  fonasa: {
    bot: 'Sí ✅ En Clínica Vidamar atendemos a pacientes FONASA (tramos B, C y D) en Modalidad Libre Elección. Aceptamos <strong>bono electrónico Imed</strong> que puedes pagar acá mismo con tu huella, o el <strong>bono web</strong> que puedes comprar en mi.fonasa.gob.cl y traerlo.\n\n¿Quieres agendar una hora?',
    quick: [
      { label: '¡Sí, agendar!', next: 'chooseSpecialty' },
      { label: '¿Y con ISAPRE?', next: 'isapre' },
      { label: 'Volver', next: 'welcome' }
    ]
  },
  isapre: {
    bot: 'Sí, tenemos convenio con <strong>Banmédica, Colmena, Cruz Blanca, Vida Tres y Consalud</strong>. El copago se calcula automático al agendar y lo puedes pagar online con tu huella digital (Imed) o Webpay.\n\n¿Listo/a para reservar?',
    quick: [
      { label: 'Sí, agendar', next: 'chooseSpecialty' },
      { label: 'Volver', next: 'welcome' }
    ]
  },
  info: {
    bot: '📍 Estamos en <strong>Av. Comercio 1990, Edificio Olas de Pichilemu</strong>, Playa Hermosa.\n\n🕐 <strong>Horario:</strong>\n• Lunes a Viernes: 08:00 – 12:30 / 14:00 – 16:30\n• Sábados: 08:30 – 12:00\n\n📞 +56 9 0000 0000\n✉️ contacto@clinicavidamar.cl',
    quick: [
      { label: 'Agendar hora', next: 'chooseSpecialty' },
      { label: 'Hablar con humano', next: 'human' }
    ]
  },
  human: {
    bot: 'Por supuesto 🙂 Te conecto con nuestro equipo por WhatsApp. Haz clic aquí para ir directo 👉 <a href="https://wa.me/56900000000" target="_blank" style="color:var(--brand);font-weight:600;text-decoration:underline;">Abrir WhatsApp</a>\n\n¿Algo más mientras tanto?',
    quick: [
      { label: 'Agendar una hora', next: 'chooseSpecialty' },
      { label: 'No, gracias', next: 'bye' }
    ]
  },
  bye: {
    bot: 'Gracias por escribir 💙 Recuerda que estoy disponible 24/7. ¡Cuídate mucho y nos vemos pronto en Vidamar!',
    quick: [
      { label: 'Empezar de nuevo', next: 'welcome' }
    ]
  }
};

/* ---------- Render helpers ---------- */
function addBotMessage(text, onDone) {
  const typing = document.createElement('div');
  typing.className = 'msg msg--bot';
  typing.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const msg = document.createElement('div');
    msg.className = 'msg msg--bot';
    msg.innerHTML = `<div class="msg__bubble">${text.replace(/\n/g, '<br>')}</div>`;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    onDone?.();
  }, 700 + Math.random() * 400);
}

function addUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'msg msg--user';
  msg.innerHTML = `<div class="msg__bubble">${text}</div>`;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function renderQuick(options) {
  chatQuick.innerHTML = '';
  if (!options || !options.length) return;
  options.forEach(opt => {
    const b = document.createElement('button');
    b.textContent = opt.label;
    b.addEventListener('click', () => {
      addUserMessage(opt.label);
      chatQuick.innerHTML = '';
      const current = FLOW[state.step];
      current.onChoice?.(opt);
      pushStep(opt.next);
    });
    chatQuick.appendChild(b);
  });
}

function pushStep(stepName) {
  state.step = stepName;
  const step = FLOW[stepName];
  if (!step) return;

  const text = typeof step.bot === 'function' ? step.bot() : step.bot;

  addBotMessage(text, () => {
    // quick replies
    if (step.quick) {
      const quick = typeof step.quick === 'function' ? step.quick() : step.quick;
      renderQuick(quick);
    } else {
      chatQuick.innerHTML = '';
    }
    // auto advance
    if (step.auto) step.auto();
  });
}

function initConversation() {
  pushStep('welcome');
}

/* ---------- Input libre ---------- */
chatForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = chatInput.value.trim();
  if (!val) return;
  chatInput.value = '';
  addUserMessage(val);

  const step = FLOW[state.step];
  if (step?.free && step.onInput) {
    const nextStep = step.onInput(val);
    pushStep(nextStep);
  } else {
    // Mensaje libre no esperado: respuesta inteligente básica
    handleFreeText(val);
  }
});

function handleFreeText(text) {
  const t = text.toLowerCase();
  if (/(hola|buenas|hey|hi)/.test(t)) {
    addBotMessage('¡Hola! 👋 Bienvenido/a. ¿Quieres agendar una hora médica?', () => {
      renderQuick([
        { label: 'Sí, agendar', next: 'chooseSpecialty' },
        { label: 'Tengo otra duda', next: 'welcome' }
      ]);
    });
    return;
  }
  if (/(fonasa|isapre|bono|pagar|precio|valor|costo)/.test(t)) {
    pushStep('fonasa');
    return;
  }
  if (/(horario|direcci|donde|ubicaci|como llegar|telef)/.test(t)) {
    pushStep('info');
    return;
  }
  if (/(cita|hora|agendar|reservar|agenda)/.test(t)) {
    pushStep('chooseSpecialty');
    return;
  }
  // Default
  addBotMessage('Entendido. En producción Mar conecta con Claude AI para responder cualquier cosa sobre Vidamar 🌊. ¿Te puedo ayudar a agendar?', () => {
    renderQuick([
      { label: 'Sí, agendar', next: 'chooseSpecialty' },
      { label: 'Hablar con humano', next: 'human' }
    ]);
  });
}
