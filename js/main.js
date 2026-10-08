/* ===== MAIN.JS — Julio Agung Portfolio (Forest Quest) ===== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) document.documentElement.classList.add('motion');

// ---- OPENING SCREEN ("ketuk untuk mulai") ----
// Everything that should wait for the visitor's tap subscribes via whenQuestStarts().
const root = document.documentElement;
function whenQuestStarts(fn) {
  if (!root.classList.contains('locked')) fn();
  else document.addEventListener('quest:start', fn, { once: true });
}

(function opening() {
  const splash = document.getElementById('splash');
  if (!splash || !root.classList.contains('locked')) return;
  const fill = document.getElementById('splash-fill');
  const status = document.getElementById('splash-status');
  const startBtn = document.getElementById('splash-start');
  let pct = 0, loaded = false, started = false;
  const MIN_LOAD = 1400;
  const t0 = performance.now();

  // fake-but-honest loader: creeps to 90% and completes once the page has loaded
  window.addEventListener('load', () => { loaded = true; }, { once: true });
  if (document.readyState === 'complete') loaded = true;
  const tick = setInterval(() => {
    const done = loaded && performance.now() - t0 > MIN_LOAD;
    pct = done ? 100 : Math.min(pct + 3 + Math.random() * 6, 90);
    fill.style.width = pct + '%';
    status.textContent = 'loading quest… ' + Math.round(pct) + '%';
    if (done) {
      clearInterval(tick);
      splash.classList.add('ready');
      startBtn.focus({ preventScroll: true });
    }
  }, 90);

  function start(x, y) {
    if (started) return;
    started = true;
    clearInterval(tick);
    splash.style.setProperty('--sx', x + 'px');
    splash.style.setProperty('--sy', y + 'px');
    document.dispatchEvent(new Event('quest:start')); // synchronous: music plays inside the gesture
    splash.classList.add('exiting');
    root.classList.remove('locked');
    // remove after the iris wipe (timer as a backup in case animationend never fires)
    splash.addEventListener('animationend', () => splash.remove(), { once: true });
    setTimeout(() => splash.remove(), reduceMotion ? 0 : 1200);
  }

  splash.addEventListener('click', e => start(e.clientX, e.clientY));
  window.addEventListener('keydown', function onKey(e) {
    if (started) return window.removeEventListener('keydown', onKey);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      start(window.innerWidth / 2, window.innerHeight / 2);
    }
  });
})();

// ---- SCROLL: progress bar, nav hide/show, active link, timeline fill ----
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href')));
const timeline = document.getElementById('timeline');
const timelineFill = timeline && timeline.querySelector('.timeline-fill');
let lastY = window.scrollY;
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  nav.classList.toggle('hide', y > lastY && y > 320);
  lastY = y;

  let current = null;
  sections.forEach(sec => { if (sec && y >= sec.offsetTop - 200) current = sec.id; });
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + current));

  if (timelineFill) {
    const r = timeline.getBoundingClientRect();
    const filled = Math.min(Math.max(window.innerHeight * 0.65 - r.top, 0), r.height);
    timelineFill.style.setProperty('--p', filled + 'px');
  }
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
onScroll();

// ---- REVEAL ON SCROLL ----
document.querySelectorAll('[data-anim="stagger"] > *').forEach((el, i) => el.style.setProperty('--i', i));

// split the pixel title into letters that drop in one by one
const guildTitle = document.getElementById('guild-title');
if (guildTitle) {
  guildTitle.innerHTML = [...guildTitle.textContent]
    .map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join('');
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// clip-path reveals start with zero visible area, which IntersectionObserver
// never reports as intersecting — watch their parent instead
const clipped = new Map();
const parentObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    clipped.get(entry.target).forEach(el => el.classList.add('in'));
    parentObserver.unobserve(entry.target);
  });
}, { threshold: 0, rootMargin: '0px 0px -15% 0px' });

// stagger siblings that enter together
document.querySelectorAll('.reveal').forEach(el => {
  const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  const idx = siblings.indexOf(el);
  if (idx > 0 && !el.style.transitionDelay) el.style.transitionDelay = Math.min(idx, 6) * 80 + 'ms';

  if (el.dataset.anim === 'mask' || el.dataset.anim === 'type') {
    const parent = el.parentElement;
    if (!clipped.has(parent)) { clipped.set(parent, []); parentObserver.observe(parent); }
    clipped.get(parent).push(el);
  } else {
    observer.observe(el);
  }
});

// ---- HERO CARD: drop, land, tilt ----
const cardWrap = document.getElementById('card-wrap');
const cardDrop = document.getElementById('card-drop');
const card = document.getElementById('char-card');

if (cardDrop && card) {
  const land = () => {
    card.classList.add('landed');
    cardWrap.classList.add('landed');
    document.querySelector('.hero-grid').classList.add('shake');
  };
  if (reduceMotion) land();
  else cardDrop.addEventListener('animationend', land, { once: true });

  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (px * 16).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 16).toFixed(2) + 'deg');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }
}

// ---- PIXEL RUNNER: walk to the flag, collect sparks, clear quest, repeat ----
(function runnerGame() {
  const stage = document.getElementById('stage');
  const runner = document.getElementById('runner');
  const flag = document.getElementById('flag');
  const pop = document.getElementById('clear-pop');
  if (!stage || !runner || !flag || reduceMotion) return;

  const sparks = [...stage.querySelectorAll('.spark')];
  const SPEED = 150;          // px per second
  const START_DELAY = 1800;   // wait for the card to land
  let x = 0, state = 'idle', last = 0, frameTimer = 0, visible = true, raf = null;

  const target = () => flag.offsetLeft - runner.offsetWidth - 8;

  function jump() {
    runner.classList.remove('jump');
    void runner.offsetWidth; // restart animation
    runner.classList.add('jump');
  }

  function collect(spark) {
    spark.classList.add('got');
    const plus = document.createElement('span');
    plus.className = 'plus';
    plus.textContent = '+1';
    plus.style.left = spark.offsetLeft - 4 + 'px';
    stage.appendChild(plus);
    plus.addEventListener('animationend', () => plus.remove());
  }

  function reset() {
    runner.classList.add('fade');
    setTimeout(() => {
      x = 0;
      runner.style.transform = 'translateX(0)';
      runner.classList.remove('fade', 'cheer');
      flag.classList.remove('raised');
      pop.classList.remove('show');
      sparks.forEach(s => s.classList.remove('got'));
      setTimeout(() => { state = 'walk'; last = 0; loop(); }, 700);
    }, 450);
  }

  function finish() {
    state = 'done';
    runner.dataset.frame = '0';
    flag.classList.add('raised');
    setTimeout(() => {
      runner.classList.add('cheer');
      pop.classList.add('show');
    }, 500);
    setTimeout(reset, 3600);
  }

  function step(t) {
    raf = null;
    if (state !== 'walk' || !visible) return;
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
    last = t;
    x = Math.min(x + SPEED * dt, target());
    runner.style.transform = `translateX(${x}px)`;

    frameTimer += dt;
    if (frameTimer > 0.14) { frameTimer = 0; runner.dataset.frame = runner.dataset.frame === '1' ? '0' : '1'; }

    const center = x + runner.offsetWidth / 2;
    sparks.forEach(s => {
      if (!s.classList.contains('got') && Math.abs(s.offsetLeft - center) < 10) {
        jump();
        collect(s);
      }
    });

    if (x >= target()) return finish();
    raf = requestAnimationFrame(step);
  }

  function loop() { if (!raf && state === 'walk' && visible) raf = requestAnimationFrame(step); }

  // only animate while the hero is on screen
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    last = 0;
    loop();
  }).observe(stage);

  stage.addEventListener('click', jump);
  window.addEventListener('resize', () => {
    x = Math.min(x, target());
    runner.style.transform = `translateX(${x}px)`;
  });

  whenQuestStarts(() => setTimeout(() => { state = 'walk'; loop(); }, START_DELAY));
})();

// ---- BACKGROUND MUSIC ----
// Drop an mp3 at audio/bgm.mp3 — the button only appears once the file loads.
(function music() {
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('music-btn');
  if (!audio || !btn) return;

  const label = btn.querySelector('.music-label');
  const KEY = 'bgm-on';
  const TARGET_VOLUME = 0.35;
  let fadeTimer = null;
  let wantPlaying = false;

  const remember = on => { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch {} };

  function render(playing) {
    btn.classList.toggle('playing', playing);
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Matikan musik' : 'Putar musik');
    label.textContent = playing ? 'bgm on' : 'bgm off';
  }

  function fadeTo(vol, done) {
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      const next = audio.volume + (vol > audio.volume ? 0.03 : -0.03);
      if ((vol > audio.volume && next >= vol) || (vol <= audio.volume && next <= vol)) {
        audio.volume = Math.max(0, Math.min(1, vol));
        clearInterval(fadeTimer);
        done && done();
      } else {
        audio.volume = Math.max(0, Math.min(1, next));
      }
    }, 40);
  }

  function play() {
    wantPlaying = true;
    audio.volume = 0;
    return audio.play().then(() => {
      render(true);
      remember(true);
      fadeTo(TARGET_VOLUME);
      return true;
    }).catch(() => {
      wantPlaying = false;
      render(false);
      return false;
    });
  }

  function pause(save = true) {
    wantPlaying = false;
    render(false);
    if (save) remember(false);
    fadeTo(0, () => audio.pause());
  }

  btn.addEventListener('click', () => (audio.paused || !wantPlaying ? play() : pause()));

  audio.addEventListener('loadedmetadata', () => { btn.hidden = false; }, { once: true });
  if (audio.readyState >= 1) btn.hidden = false;

  // The opening tap is a user gesture, so the browser lets the music start right away.
  whenQuestStarts(() => play());

  // quiet when the tab is in the background
  document.addEventListener('visibilitychange', () => {
    if (!wantPlaying) return;
    if (document.hidden) audio.pause();
    else audio.play().catch(() => {});
  });
})();
