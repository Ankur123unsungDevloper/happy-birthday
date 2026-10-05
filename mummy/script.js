/* =========================================================
   HAPPY BIRTHDAY MOM — SCRIPT
   ========================================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const isMobile = () => window.matchMedia('(max-width: 680px)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* The opening line typed out at the top of the birthday message.
   Edit this freely. */
const typewriterText = "Dear Mom, there aren't enough words for everything you've given me.";

document.addEventListener('DOMContentLoaded', () => {
  initAmbientParticles();
  initHeroOpen();
  initScrollReveal();
  initGallery();
  initGiftBox();
  $('#footer-year').textContent = new Date().getFullYear();
});

/* =========================================================
   AMBIENT BACKGROUND: floating hearts + sparkles
   ========================================================= */
function initAmbientParticles(){
  const canvas = $('#ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  const count = isMobile() ? 16 : 34;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makeParticles(){
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 10 + 6,
      isHeart: Math.random() > 0.55,
      o: Math.random() * 0.35 + 0.12,
      dy: -(Math.random() * 0.35 + 0.08),
      sway: Math.random() * 0.6 + 0.2,
      t: Math.random() * Math.PI * 2,
    }));
  }

  function drawHeart(x, y, size, opacity){
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
    ctx.fillStyle = `rgba(207, 124, 144, ${opacity})`;
    ctx.fill();
    ctx.restore();
  }

  function drawSparkle(x, y, size, opacity){
    ctx.beginPath();
    ctx.arc(x, y, size / 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(221, 185, 123, ${opacity})`;
    ctx.fill();
  }

  function draw(){
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.t += 0.01;
      p.y += p.dy;
      const x = p.x + Math.sin(p.t) * p.sway * 12;
      if (p.y < -20) p.y = h + 20;

      if (p.isHeart) drawHeart(x, p.y, p.size, p.o);
      else drawSparkle(x, p.y, p.size, p.o);
    });
    if (!prefersReducedMotion) requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  draw();
  window.addEventListener('resize', () => { resize(); makeParticles(); });
}

/* =========================================================
   HERO: open the surprise, reveal the rest of the site
   ========================================================= */
function initHeroOpen(){
  const btn = $('#open-surprise');
  const main = $('#main-content');
  if (!btn || !main) return;

  btn.addEventListener('click', () => {
    main.hidden = false;
    burst($('#celebration-canvas'), window.innerWidth / 2, window.innerHeight, 30);

    requestAnimationFrame(() => {
      $('#message').scrollIntoView({ behavior: 'smooth' });
    });

    startTypewriter();
  }, { once: true });
}

/* =========================================================
   TYPEWRITER for the message lead line
   ========================================================= */
function startTypewriter(){
  const el = $('#typewriter-line');
  const rest = $('#message-rest');
  if (!el) return;

  if (prefersReducedMotion){
    el.textContent = typewriterText;
    if (rest) rest.classList.add('in-view');
    return;
  }

  el.classList.add('is-typing');
  let i = 0;

  function type(){
    if (i <= typewriterText.length){
      el.textContent = typewriterText.slice(0, i);
      i++;
      setTimeout(type, 28);
    } else {
      el.classList.remove('is-typing');
      if (rest) rest.classList.add('in-view');
    }
  }
  // Give the scroll a moment to settle before typing starts.
  setTimeout(type, 700);
}

/* =========================================================
   SCROLL-TRIGGERED REVEAL
   ========================================================= */
function initScrollReveal(){
  const targets = $$('[data-anim]');
  if (!('IntersectionObserver' in window)){
    targets.forEach(t => t.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      const grid = el.closest('.special-grid, .memory-grid');
      if (grid){
        const siblings = $$(':scope > [data-anim]', grid);
        const index = siblings.indexOf(el);
        el.style.setProperty('--stagger-delay', `${index * 0.08}s`);
      }

      el.classList.add('in-view');
      observer.unobserve(el);
    });
    // A low threshold keeps this working even for sections taller than
    // the viewport (e.g. a single-column memory grid on mobile), which
    // would otherwise never reach a higher visible-area ratio.
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

  targets.forEach(t => observer.observe(t));
}

/* =========================================================
   GALLERY + LIGHTBOX
   ========================================================= */
function initGallery(){
  const cards = $$('.memory-card');
  if (!cards.length) return;

  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox-img');
  const lightboxCaption = $('#lightbox-caption');
  let currentIndex = 0;

  function render(index){
    currentIndex = (index + cards.length) % cards.length;
    const img = cards[currentIndex].querySelector('img');
    const caption = cards[currentIndex].querySelector('figcaption');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : '';
  }

  function open(index){
    render(index);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close(){
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => open(i));
  });

  $('#lightbox-close').addEventListener('click', close);
  $('#lightbox-prev').addEventListener('click', () => render(currentIndex - 1));
  $('#lightbox-next').addEventListener('click', () => render(currentIndex + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') render(currentIndex - 1);
    if (e.key === 'ArrowRight') render(currentIndex + 1);
  });
}

/* =========================================================
   GIFT BOX INTERACTION
   ========================================================= */
function initGiftBox(){
  const box = $('#gift-box');
  const message = $('#surprise-message');
  const moreBtn = $('#more-surprise-btn');
  const secondMessage = $('#second-message');
  if (!box) return;

  box.addEventListener('click', () => {
    if (box.classList.contains('is-opened')) return;
    box.classList.add('is-opened');
    message.classList.add('is-visible');

    const rect = box.getBoundingClientRect();
    burst($('#celebration-canvas'), rect.left + rect.width / 2, rect.top + rect.height / 2, isMobile() ? 40 : 70, true);

    setTimeout(() => {
      message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }, { once: true });

  if (moreBtn){
    moreBtn.addEventListener('click', () => {
      secondMessage.classList.add('is-visible');
      moreBtn.style.display = 'none';
    }, { once: true });
  }
}

/* =========================================================
   CELEBRATION BURST: confetti + floating hearts
   ========================================================= */
function burst(canvas, x, y, count, withConfetti = false){
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#cf7c90', '#ddb97b', '#f6dde2', '#b15870'];

  const hearts = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    return {
      x, y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - 1,
      size: Math.random() * 10 + 8,
      life: 1,
    };
  });

  const confetti = withConfetti ? Array.from({ length: isMobile() ? 40 : 80 }, () => ({
    x: x + (Math.random() - 0.5) * 60,
    y: y - Math.random() * 40,
    w: Math.random() * 6 + 4,
    h: Math.random() * 9 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    spin: (Math.random() - 0.5) * 9,
    dy: Math.random() * 2.2 + 1.6,
    dx: (Math.random() - 0.5) * 3,
    life: 1,
  })) : [];

  function drawHeart(px, py, size, opacity, color){
    ctx.save();
    ctx.translate(px, py);
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
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  let frame = 0;
  const maxFrames = 300;

  function animate(){
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hearts.forEach(h => {
      h.x += h.dx;
      h.y += h.dy;
      h.dy += 0.02;
      h.life -= 0.012;
      if (h.life > 0) drawHeart(h.x, h.y, h.size, Math.max(h.life, 0), 'rgba(207,124,144,0.9)');
    });

    confetti.forEach(c => {
      c.x += c.dx;
      c.y += c.dy;
      c.rotation += c.spin;
      c.life -= 0.01;
      if (c.life > 0){
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = Math.max(c.life, 0);
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    });

    if (frame < maxFrames){
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}