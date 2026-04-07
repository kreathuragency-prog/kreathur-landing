/* ========== KREATHUR AGENCY — SCRIPT ========== */

// LOADER
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('active');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.add('loaded');
  }, 1800);
});

// CUSTOM CURSOR
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
if (window.matchMedia('(pointer:fine)').matches && dot && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function moveCursor() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(moveCursor);
  })();
  document.querySelectorAll('a, button, .magnetic, .btn-primary, .btn-outline').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '52px';
      ring.style.height = '52px';
      ring.style.borderColor = 'rgba(0,229,255,.7)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'rgba(0,229,255,.4)';
    });
  });
}

// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// BURGER
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});

// SCROLL REVEAL
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });
reveals.forEach(el => revealObserver.observe(el));

// ANIMATED COUNTERS
const counters = document.querySelectorAll('.stat-num[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      let current = 0;
      const step = target / 60;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target + '+';
          clearInterval(interval);
        } else {
          el.textContent = Math.floor(current);
        }
      }, 30);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// MAGNETIC BUTTONS
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// TEXT SCRAMBLE
const scrambleEl = document.querySelector('[data-scramble] .title-line');
if (scrambleEl) {
  const original = scrambleEl.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  let frame = 0;
  const maxFrames = 20;
  function scramble() {
    scrambleEl.textContent = original.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      if (frame / maxFrames > i / original.length) return ch;
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    frame++;
    if (frame <= maxFrames) requestAnimationFrame(scramble);
  }
  setTimeout(scramble, 2000);
}

// PROJECT CARD TILT
document.querySelectorAll('.project-card:not(.project-card-cta)').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// CLIENT COUNT ANIMATION (simulated scarcity)
const countEl = document.getElementById('clientCount');
if (countEl) {
  const stored = sessionStorage.getItem('kreathurClients');
  if (stored) {
    countEl.textContent = stored;
  }
}
