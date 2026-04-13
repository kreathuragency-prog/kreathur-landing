/* CLÍNICA VIDAMAR · App principal */

/* Tema claro/oscuro */
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const savedTheme = localStorage.getItem('vidamar-theme');
if (savedTheme) body.setAttribute('data-theme', savedTheme);
themeToggle?.addEventListener('click', () => {
  const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', next);
  localStorage.setItem('vidamar-theme', next);
  const icon = themeToggle.querySelector('i');
  if (icon) icon.className = next === 'dark' ? 'icon-sun' : 'icon-moon';
});

/* Menú móvil */
const hamburger = document.getElementById('hamburger');
const menu = document.querySelector('.nav__menu');
hamburger?.addEventListener('click', () => {
  menu.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', menu.classList.contains('is-open'));
});
document.querySelectorAll('.nav__menu a').forEach(a => {
  a.addEventListener('click', () => menu.classList.remove('is-open'));
});

/* Doctores */
const AVATARS = {
  'dra-morales':  'linear-gradient(135deg,#20a4bf 0%,#145d82 100%)',
  'dr-rojas':     'linear-gradient(135deg,#ff7a59 0%,#ff5a5f 100%)',
  'klgo-vargas':  'linear-gradient(135deg,#2ec4b6 0%,#0b4f6c 100%)',
  'dra-pino':     'linear-gradient(135deg,#a78bfa 0%,#7c3aed 100%)',
  'nut-silva':    'linear-gradient(135deg,#f5b301 0%,#ff7a59 100%)',
  'psi-herrera':  'linear-gradient(135deg,#a9e5e8 0%,#20a4bf 100%)'
};
function doctorInitials(name) {
  return name.split(' ')
    .filter(w => w.length > 2 && !/^(dra|dr|klgo|nut|psi)\.?$/i.test(w))
    .slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
const DOCTORS = [
  { id:'dra-morales', name:'Dra. Antonia Morales', specialty:'Medicina General Adultos', short:'Médico Cirujano · U. de Chile', price:{FONASA:8500,ISAPRE:12000,Particular:28000} },
  { id:'dr-rojas', name:'Dr. Felipe Rojas', specialty:'Pediatría', short:'Pediatra · 12 años de experiencia', price:{FONASA:9500,ISAPRE:14000,Particular:32000} },
  { id:'klgo-vargas', name:'Klgo. Matías Vargas', specialty:'Kinesiología', short:'Especialista en lesiones deportivas', price:{FONASA:7500,ISAPRE:10000,Particular:22000} },
  { id:'dra-pino', name:'Dra. Carolina Pino', specialty:'Ginecología', short:'Ginecóloga · Hospital Rancagua', price:{FONASA:12000,ISAPRE:18000,Particular:38000} },
  { id:'nut-silva', name:'Nut. Javiera Silva', specialty:'Nutrición', short:'Nutricionista clínica y deportiva', price:{FONASA:6500,ISAPRE:9500,Particular:22000} },
  { id:'psi-herrera', name:'Psi. Valentina Herrera', specialty:'Psicología', short:'Psicóloga clínica', price:{FONASA:10000,ISAPRE:14000,Particular:30000} }
].map(d => ({ ...d, avatar: AVATARS[d.id], initialsText: doctorInitials(d.name) }));

/* Render equipo */
const teamGrid = document.getElementById('teamGrid');
if (teamGrid) {
  teamGrid.innerHTML = DOCTORS.map(d => `
    <article class="team-card">
      <div class="team-card__photo" style="background:${d.avatar};">
        <span class="team-card__initials">${d.initialsText}</span>
      </div>
      <div class="team-card__body">
        <strong>${d.name}</strong>
        <span>${d.specialty}</span>
        <p>${d.short}</p>
      </div>
    </article>`).join('');
}

/* Booking state */
const booking = { specialty:null, doctor:null, date:null, time:null, name:'', rut:'', phone:'', email:'', payment:'FONASA' };

/* Stepper */
const steps = document.querySelectorAll('#bookingSteps li');
const panels = document.querySelectorAll('.booking__panel');

function goToStep(step) {
  steps.forEach(s => s.classList.toggle('is-active', parseInt(s.dataset.step) <= step));
  panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel == step));
  if (step == 2) renderDoctors();
  if (step == 3) updateSummary();
  document.getElementById('agendar').scrollIntoView({ behavior:'smooth', block:'start' });
}
document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => {
    const next = parseInt(btn.dataset.next);
    if (next === 2) {
      const sel = document.querySelector('input[name="specialty"]:checked');
      if (!sel) return flash('Selecciona una especialidad.');
      booking.specialty = sel.value;
    }
    if (next === 3) {
      if (!booking.doctor) return flash('Elige un/a profesional.');
      booking.date = document.getElementById('bookDate').value;
      booking.time = document.getElementById('bookTime').value;
      if (!booking.date || !booking.time) return flash('Selecciona fecha y hora.');
    }
    goToStep(next);
  });
});
document.querySelectorAll('[data-prev]').forEach(btn => {
  btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.prev)));
});

function renderDoctors() {
  const list = document.getElementById('doctorsList');
  const filtered = DOCTORS.filter(d => d.specialty === booking.specialty);
  list.innerHTML = filtered.map(d => `
    <label class="doctor ${booking.doctor?.id===d.id?'is-selected':''}" data-id="${d.id}">
      <input type="radio" name="doctor" value="${d.id}" ${booking.doctor?.id===d.id?'checked':''} />
      <div class="doctor__img" style="background:${d.avatar};">
        <span class="doctor__initials">${d.initialsText}</span>
      </div>
      <div class="doctor__meta"><strong>${d.name}</strong><span>${d.short}</span></div>
    </label>`).join('') || '<p style="color:var(--text-soft);padding:20px 0;">No hay profesionales disponibles.</p>';

  list.querySelectorAll('.doctor').forEach(el => {
    el.addEventListener('click', () => {
      list.querySelectorAll('.doctor').forEach(d => d.classList.remove('is-selected'));
      el.classList.add('is-selected');
      booking.doctor = DOCTORS.find(d => d.id === el.dataset.id);
    });
  });
}

function formatCLP(n) { return '$' + n.toLocaleString('es-CL'); }

function updateSummary() {
  const p = document.querySelector('input[name="payment"]:checked');
  if (p) booking.payment = p.value;
  const total = booking.doctor ? booking.doctor.price[booking.payment] : 0;
  const ul = document.querySelector('#bookingSummary ul');
  ul.innerHTML = `
    <li><span>Especialidad</span><strong>${booking.specialty || '—'}</strong></li>
    <li><span>Profesional</span><strong>${booking.doctor?.name || '—'}</strong></li>
    <li><span>Fecha</span><strong>${booking.date || '—'}</strong></li>
    <li><span>Hora</span><strong>${booking.time || '—'}</strong></li>
    <li><span>Previsión</span><strong>${booking.payment}</strong></li>`;
  document.getElementById('bookingTotal').textContent = total ? formatCLP(total) : '—';
}
document.querySelectorAll('input[name="payment"]').forEach(r => r.addEventListener('change', updateSummary));

document.getElementById('confirmBooking')?.addEventListener('click', () => {
  booking.name = document.getElementById('bookName').value;
  booking.rut = document.getElementById('bookRut').value;
  booking.phone = document.getElementById('bookPhone').value;
  booking.email = document.getElementById('bookEmail').value;
  if (!booking.name || !booking.rut || !booking.phone) return flash('Completa tus datos.');

  const btn = document.getElementById('confirmBooking');
  btn.disabled = true;
  btn.innerHTML = '<i class="icon-loader-2"></i> Procesando…';

  setTimeout(() => {
    document.querySelectorAll('.booking__panel').forEach(p => p.classList.remove('is-active'));
    document.querySelector('[data-panel="done"]').classList.add('is-active');
    document.getElementById('confirmText').innerHTML = `
      <strong>${booking.name.split(' ')[0]}</strong>, tu hora con <strong>${booking.doctor.name}</strong>
      quedó para el <strong>${booking.date}</strong> a las <strong>${booking.time}</strong>.
      Te enviaremos los detalles a <strong>${booking.phone}</strong>.`;
    btn.disabled = false;
    btn.innerHTML = '<i class="icon-check-circle"></i> Confirmar hora & pagar';
  }, 1200);
});

document.getElementById('newBooking')?.addEventListener('click', () => {
  booking.specialty = null; booking.doctor = null;
  document.querySelectorAll('input[type="radio"]').forEach(r => { if (r.name !== 'payment') r.checked = false; });
  document.querySelectorAll('.booking__row input, #bookTime').forEach(i => i.value = '');
  goToStep(1);
});

function flash(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#ff5a5f;color:#fff;padding:14px 22px;border-radius:12px;font-size:.9rem;z-index:200;box-shadow:0 10px 30px rgba(0,0,0,.2);';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* Animación on scroll */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation = 'fadeUp .6s ease both';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.card, .team-card, .testimonial, .section__head').forEach(el => observer.observe(el));

/* Default date */
const dateInput = document.getElementById('bookDate');
if (dateInput) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  dateInput.min = t.toISOString().split('T')[0];
  dateInput.value = t.toISOString().split('T')[0];
}
