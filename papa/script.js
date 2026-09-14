/* =========================================================
   BIRTHDAY WEBSITE FOR PAPA — SCRIPT
   =========================================================
   EDIT THESE THREE VALUES to personalize the site.
   ========================================================= */
const papaName = "Papa";
const childName = "Ankur";
const birthdayDate = "2026-09-14"; // format: YYYY-MM-DD (year is ignored for the yearly countdown)

/* =========================================================
   Small helpers
   ========================================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initIntroSequence();
  initBackgroundParticles();
  initFinalParticles();
  initScrollReveal();
  initHeroWordReveal();
  initGallery();
  initCountdown();
  initParallax();
  initMusic();
  initCelebration();
  $('#footer-year').textContent = new Date().getFullYear();
});

/* =========================================================
   1. INTRO / WELCOME SEQUENCE
   ========================================================= */
function initIntroSequence(){
  const intro = $('#intro');
  const lines = $$('[data-reveal]', intro);
  const openBtn = $('#open-surprise');
  const site = $('#site');

  // Reveal each line/button in the intro one at a time.
  lines.forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), 500 + i * 1100);
  });

  openBtn.addEventListener('click', () => {
    intro.classList.add('is-closing');
    site.hidden = false;
    document.body.style.overflow = '';

    // A small burst of golden particles to mark the reveal.
    burstParticles(window.innerWidth / 2, window.innerHeight / 2, 36);

    // Let the intro fade out, then hand off scrolling to the main site.
    setTimeout(() => {
      intro.remove();
      $('#hero').scrollIntoView({ behavior: 'auto' });
      startHeroReveal();
    }, 1100);

    // Music can only start after this user gesture.
    tryStartMusic();
  }, { once: true });

  // Lock scrolling until the surprise is opened.
  document.body.style.overflow = 'hidden';
}

/* =========================================================
   2. INTRO PARTICLE CANVAS (stars + soft glow motes)
   ========================================================= */
function initBackgroundParticles(){
  setupParticleCanvas($('#intro-particles'), { count: isMobile() ? 26 : 60, speed: 0.15 });
  setupParticleCanvas($('#bg-particles'), { count: isMobile() ? 18 : 45, speed: 0.1, reactive: true });
}

function setupParticleCanvas(canvas, { count, speed, reactive = false }){
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles, mouse = { x: null, y: null };

  function resize(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function makeParticles(){
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      o: Math.random() * 0.5 + 0.15,
      dx: (Math.random() - 0.5) * speed,
      dy: -Math.random() * speed - 0.03,
    }));
  }

  function draw(){
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;

      if (reactive && mouse.x !== null){
        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dist < 120){
          p.x += (p.x - mouse.x) * 0.004;
          p.y += (p.y - mouse.y) * 0.004;
        }
      }

      if (p.y < -10) p.y = h + 10;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 167, 94, ${p.o})`;
      ctx.fill();
    });
    if (!prefersReducedMotion) requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  draw();

  window.addEventListener('resize', () => { resize(); makeParticles(); });

  if (reactive && !isMobile()){
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  }
}

/* Small celebratory particle burst used when opening the surprise */
function burstParticles(x, y, count){
  const canvas = $('#celebration-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    return {
      x, y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      r: Math.random() * 2.5 + 1,
      life: 1,
    };
  });

  function tick(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.03;
      p.life -= 0.015;
      if (p.life > 0){
        alive = true;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 167, 94, ${p.life})`;
        ctx.fill();
      }
    });
    if (alive) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  tick();
}

/* =========================================================
   3. FINAL SECTION PARTICLES (glowing golden dust)
   ========================================================= */
function initFinalParticles(){
  setupParticleCanvas($('#final-particles'), { count: isMobile() ? 16 : 40, speed: 0.08 });
}

/* =========================================================
   4. SCROLL-TRIGGERED REVEAL (IntersectionObserver)
   ========================================================= */
function initScrollReveal(){
  const targets = $$('[data-anim], [data-reveal-fade], [data-reveal-final]');
  if (!('IntersectionObserver' in window)){
    targets.forEach(t => t.classList.add('in-view', 'is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Stagger cards inside the same grid slightly.
      if (el.closest('.lessons-grid')){
        const siblings = $$('.lesson-card', el.closest('.lessons-grid'));
        const index = siblings.indexOf(el);
        el.style.setProperty('--stagger-delay', `${index * 0.08}s`);
      }

      if (el.hasAttribute('data-reveal-fade')) el.classList.add('in-view');
      if (el.hasAttribute('data-reveal-final')) el.classList.add('is-visible');
      if (el.hasAttribute('data-anim')) el.classList.add('in-view');

      observer.unobserve(el);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(t => observer.observe(t));
}

/* =========================================================
   5. HERO CINEMATIC WORD REVEAL
   ========================================================= */
function initHeroWordReveal(){
  // Runs once the surprise is opened (see startHeroReveal below).
}

function startHeroReveal(){
  const words = $$('.reveal-word');
  words.forEach((w, i) => {
    setTimeout(() => w.classList.add('is-visible'), i * 220);
  });
  setTimeout(() => {
    const sub = $('.hero-sub');
    if (sub) sub.classList.add('in-view');
  }, words.length * 220 + 200);
}

/* =========================================================
   6. GALLERY + LIGHTBOX
   ========================================================= */
function initGallery(){
  const items = $$('.gallery-item');
  if (!items.length) return;

  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox-img');
  let currentIndex = 0;

  function open(index){
    currentIndex = index;
    const img = items[index].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close(){
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function show(delta){
    currentIndex = (currentIndex + delta + items.length) % items.length;
    const img = items[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
  });

  $('#lightbox-close').addEventListener('click', close);
  $('#lightbox-prev').addEventListener('click', () => show(-1));
  $('#lightbox-next').addEventListener('click', () => show(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(-1);
    if (e.key === 'ArrowRight') show(1);
  });
}

/* =========================================================
   7. BIRTHDAY COUNTDOWN
   ========================================================= */
function initCountdown(){
  const container = $('#countdown');
  if (!container) return;

  const parsed = new Date(`${birthdayDate}T00:00:00`);
  if (isNaN(parsed)){
    container.innerHTML = `<p class="countdown-today">Happy Birthday, ${papaName}!</p>`;
    return;
  }

  function nextBirthday(){
    const now = new Date();
    const target = new Date(now.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0);
    const isToday = now.toDateString() === target.toDateString();
    if (target < now && !isToday) target.setFullYear(target.getFullYear() + 1);
    return { target, isToday };
  }

  const { isToday } = nextBirthday();

  if (isToday){
    container.innerHTML = `<p class="countdown-today">Today is YOUR day! &#127881;</p>`;
    return;
  }

  container.innerHTML = `
    <div class="countdown-unit"><span class="countdown-number" data-unit="days">0</span><span class="countdown-label">Days</span></div>
    <div class="countdown-unit"><span class="countdown-number" data-unit="hours">0</span><span class="countdown-label">Hours</span></div>
    <div class="countdown-unit"><span class="countdown-number" data-unit="minutes">0</span><span class="countdown-label">Minutes</span></div>
    <div class="countdown-unit"><span class="countdown-number" data-unit="seconds">0</span><span class="countdown-label">Seconds</span></div>
  `;

  const els = {
    days: $('[data-unit="days"]', container),
    hours: $('[data-unit="hours"]', container),
    minutes: $('[data-unit="minutes"]', container),
    seconds: $('[data-unit="seconds"]', container),
  };

  function tick(){
    const { target, isToday: today } = nextBirthday();
    if (today){
      container.innerHTML = `<p class="countdown-today">Today is YOUR day! &#127881;</p>`;
      clearInterval(timer);
      return;
    }
    const diff = Math.max(0, target - new Date());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    els.days.textContent = d;
    els.hours.textContent = String(h).padStart(2, '0');
    els.minutes.textContent = String(m).padStart(2, '0');
    els.seconds.textContent = String(s).padStart(2, '0');
  }

  tick();
  const timer = setInterval(tick, 1000);
}

/* =========================================================
   8. PARALLAX (appreciation section)
   ========================================================= */
function initParallax(){
  const layer = $('[data-parallax]');
  if (!layer || prefersReducedMotion) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = layer.parentElement.getBoundingClientRect();
      const offset = rect.top * 0.12;
      layer.style.transform = `translateY(${offset}px)`;
      ticking = false;
    });
  });
}

/* =========================================================
   9. MUSIC CONTROL
   ========================================================= */
let musicIntentToPlay = false;

function initMusic(){
  const btn = $('#music-toggle');
  const audio = $('#bg-music');
  const playIcon = $('.music-icon--play');
  const pauseIcon = $('.music-icon--pause');

  btn.addEventListener('click', () => {
    if (audio.paused){
      audio.play().catch(() => {});
      musicIntentToPlay = true;
    } else {
      audio.pause();
      musicIntentToPlay = false;
    }
  });

  audio.addEventListener('play', () => {
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Pause background music');
    playIcon.hidden = true;
    pauseIcon.hidden = false;
  });

  audio.addEventListener('pause', () => {
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Play background music');
    playIcon.hidden = false;
    pauseIcon.hidden = true;
  });
}

function tryStartMusic(){
  const audio = $('#bg-music');
  if (!audio || !audio.src) return;
  // Browsers may still block this; the visible music button is the fallback.
  audio.play().then(() => { musicIntentToPlay = true; }).catch(() => {});
}

/* =========================================================
   10. CELEBRATION: confetti + hearts + fireworks
   ========================================================= */
function initCelebration(){
  const btn = $('#celebrate-btn');
  if (!btn) return;
  btn.addEventListener('click', runCelebration);
}

function runCelebration(){
  const canvas = $('#celebration-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  document.body.classList.add('celebrating');

  const confettiCount = isMobile() ? 60 : 130;
  const colors = ['#e8a75e', '#c07d3d', '#f4ead9', '#8a2f3a'];

  const confetti = Array.from({ length: confettiCount }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    w: Math.random() * 6 + 4,
    h: Math.random() * 10 + 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    spin: (Math.random() - 0.5) * 8,
    dy: Math.random() * 2 + 2,
    dx: (Math.random() - 0.5) * 1.5,
    life: 1,
  }));

  const hearts = Array.from({ length: isMobile() ? 8 : 16 }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 200,
    size: Math.random() * 14 + 10,
    dy: Math.random() * 1 + 0.6,
    sway: Math.random() * 2,
    o: Math.random() * 0.5 + 0.4,
    t: Math.random() * Math.PI * 2,
  }));

  let fireworks = [];
  function spawnFirework(){
    const x = canvas.width * (0.2 + Math.random() * 0.6);
    const y = canvas.height * (0.15 + Math.random() * 0.35);
    const count = isMobile() ? 20 : 34;
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < count; i++){
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 2.6 + 1.4;
      fireworks.push({
        x, y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color,
        life: 1,
      });
    }
  }
  spawnFirework();
  const fireworkTimer1 = setTimeout(spawnFirework, 500);
  const fireworkTimer2 = setTimeout(spawnFirework, 1100);

  function drawHeart(x, y, size, opacity, color){
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 20, size / 20);
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(0, 0, -10, 0, -10, -6);
    ctx.bezierCurveTo(-10, -12, 0, -12, 0, -4);
    ctx.bezierCurveTo(0, -12, 10, -12, 10, -6);
    ctx.bezierCurveTo(10, 0, 0, 0, 0, 5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fill();
    ctx.restore();
  }

  let frame = 0;
  const maxFrames = 420; // ~7s at 60fps, tapers naturally as particles die

  function animate(){
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confetti.forEach(c => {
      c.x += c.dx;
      c.y += c.dy;
      c.rotation += c.spin;
      if (c.y > canvas.height + 20) c.life -= 1; // mark for cleanup by moving offscreen
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    });

    hearts.forEach(h => {
      h.t += 0.02;
      h.y -= h.dy;
      const x = h.x + Math.sin(h.t) * h.sway * 10;
      drawHeart(x, h.y, h.size, h.o, 'rgba(138,47,58,0.85)');
    });

    fireworks.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.025;
      p.life -= 0.012;
      if (p.life > 0){
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
    fireworks = fireworks.filter(p => p.life > 0);

    if (frame < maxFrames){
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.body.classList.remove('celebrating');
      clearTimeout(fireworkTimer1);
      clearTimeout(fireworkTimer2);
    }
  }
  animate();
}