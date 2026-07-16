/* ===== MAIN.JS — Julio Agung Portfolio ===== */

// ---- LOADER ----
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2200);
});

// ---- CUSTOM CURSOR ----
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    setTimeout(() => {
      cursorOutline.style.left = e.clientX + 'px';
      cursorOutline.style.top = e.clientY + 'px';
    }, 60);
  });
} else {
  cursorDot.style.display = 'none';
  cursorOutline.style.display = 'none';
}

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
  // Back to top
  document.getElementById('back-to-top').classList.toggle('visible', window.scrollY > 400);
});

// ---- HAMBURGER ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ---- TYPING ANIMATION ----
const titles = [
  'Full-Stack Web Developer',
  'Problem Solver',
  'Content Creator',
  'React & Node.js Dev',
  'Best Capstone @ Dicoding ASAH'
];
let titleIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-text');
function typeLoop() {
  const current = titles[titleIdx];
  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) { deleting = true; return setTimeout(typeLoop, 1800); }
  } else {
    typedEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; titleIdx = (titleIdx + 1) % titles.length; }
  }
  setTimeout(typeLoop, deleting ? 55 : 90);
}
setTimeout(typeLoop, 2500);

// ---- COUNTER ANIMATION ----
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  if (!target) return;
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, 25);
}

// ---- INTERSECTION OBSERVER ----
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    // Reveal animations
    if (el.classList.contains('skill-category') || el.classList.contains('timeline-item') || el.classList.contains('project-card')) {
      el.classList.add('visible');
    }

    // Skill bars
    if (el.classList.contains('skill-category')) {
      el.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }

    // Counters in hero
    if (el.classList.contains('hero')) {
      el.querySelectorAll('.stat-num[data-target]').forEach(animateCounter);
    }

    observer.unobserve(el);
  });
}, observerOptions);

document.querySelectorAll('.skill-category, .timeline-item, .project-card, .hero').forEach(el => observer.observe(el));

// ---- BACK TO TOP ----
document.getElementById('back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---- SMOOTH SCROLL (nav links) ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- CONTACT FORM ----
document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> Pesan Terkirim!';
  btn.style.background = 'linear-gradient(135deg, #16a34a, #22c55e)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
    btn.disabled = false;
    this.reset();
  }, 3000);
});

// ---- GLITCH EFFECT ON HOVER ----
document.querySelectorAll('.project-title').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.animation = 'none';
    el.style.textShadow = '2px 0 #8b5cf6, -2px 0 #c084fc';
    setTimeout(() => { el.style.textShadow = ''; }, 300);
  });
});
