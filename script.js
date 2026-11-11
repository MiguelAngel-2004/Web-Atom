/* ═══════════════════════════════════════════
   ATOM ELECTRICIDAD — SCRIPT
   ═══════════════════════════════════════════ */

// ═══ CANVAS HERO: RAYOS Y PARTÍCULAS ELÉCTRICAS ═══
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#E30613', '#F5C400', '#009A44', '#003087', '#ffffff'];

  let W, H, particles, lightnings, nextStrike;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  // — Partículas flotantes —
  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.r  = Math.random() * 2 + 0.5;
      this.a  = Math.random() * 0.7 + 0.1;
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.color = c;
      this.life = 1;
    }
    update() {
      this.x  += this.vx;
      this.y  += this.vy;
      this.life -= 0.003;
      if (this.y < -10 || this.life <= 0) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.a * this.life;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = this.color;
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // — Generador de rayos —
  function buildBoltPoints(x1, y1, x2, y2, roughness) {
    const pts = [[x1, y1]];
    const segs = 12;
    for (let i = 1; i < segs; i++) {
      const t  = i / segs;
      const px = x1 + (x2 - x1) * t + (Math.random() - 0.5) * roughness;
      const py = y1 + (y2 - y1) * t + (Math.random() - 0.5) * roughness * 0.3;
      pts.push([px, py]);
    }
    pts.push([x2, y2]);
    return pts;
  }

  function drawBolt(pts, color, alpha, width) {
    ctx.save();
    ctx.globalAlpha  = alpha;
    ctx.shadowBlur   = 20;
    ctx.shadowColor  = color;
    ctx.strokeStyle  = color;
    ctx.lineWidth    = width;
    ctx.lineJoin     = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    // Glow inner
    ctx.shadowBlur   = 5;
    ctx.strokeStyle  = '#ffffff';
    ctx.lineWidth    = width * 0.3;
    ctx.globalAlpha  = alpha * 0.6;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.restore();
  }

  function spawnLightning() {
    const x1  = Math.random() * W;
    const y1  = 0;
    const x2  = x1 + (Math.random() - 0.5) * 200;
    const y2  = H * (0.4 + Math.random() * 0.4);
    const col = COLORS[Math.floor(Math.random() * 3)]; // rojo / amarillo / verde
    const pts = buildBoltPoints(x1, y1, x2, y2, 80);
    const branches = [];

    // Añadir 1-3 ramas
    const nb = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < nb; i++) {
      const seg  = Math.floor(pts.length * 0.3 + Math.random() * pts.length * 0.4);
      const bx2  = pts[seg][0] + (Math.random() - 0.5) * 120;
      const by2  = pts[seg][1] + Math.random() * 80;
      branches.push({ pts: buildBoltPoints(pts[seg][0], pts[seg][1], bx2, by2, 40), col });
    }

    lightnings.push({ pts, col, branches, life: 15, maxLife: 15 });
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          ctx.save();
          ctx.globalAlpha = (1 - d / 90) * 0.15;
          ctx.strokeStyle = particles[i].color;
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function init() {
    resize();
    particles  = Array.from({ length: 100 }, () => new Particle());
    lightnings = [];
    nextStrike = Date.now() + 1500;
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    // Fondo degradado oscuro
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#030310');
    grad.addColorStop(1, '#06062a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Partículas
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();

    // Rayos
    const now = Date.now();
    if (now > nextStrike) {
      spawnLightning();
      nextStrike = now + 2000 + Math.random() * 4000;
    }

    lightnings = lightnings.filter(l => l.life > 0);
    lightnings.forEach(l => {
      const alpha = (l.life / l.maxLife) * 0.9;
      drawBolt(l.pts, l.col, alpha, 2);
      l.branches.forEach(b => drawBolt(b.pts, b.col, alpha * 0.5, 1));
      l.life--;
    });

    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  loop();
})();

// ═══ CANVAS FONDO GLOBAL (partículas sutiles) ═══
(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dots;
  const COLORS_BG = ['rgba(227,6,19,0.4)', 'rgba(245,196,0,0.3)', 'rgba(0,154,68,0.3)', 'rgba(0,48,135,0.4)'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Dot {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = (Math.random() - 0.5) * 0.2;
      this.c  = COLORS_BG[Math.floor(Math.random() * COLORS_BG.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.c;
      ctx.fill();
    }
  }

  resize();
  dots = Array.from({ length: 80 }, () => new Dot());
  window.addEventListener('resize', resize);

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => { d.update(); d.draw(); });
    requestAnimationFrame(loop);
  })();
})();

// ═══ HEADER SCROLL ═══
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ═══ MENÚ HAMBURGUESA ═══
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('mainNav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});

nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ═══ SCROLL SUAVE A SECCIONES ═══
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ═══ SCROLL REVEAL (IntersectionObserver) ═══
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Delay escalonado para elementos del mismo grupo
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i % 3 * 100);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => revealObs.observe(el));

// ═══ NAV ACTIVO EN SCROLL ═══
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');

const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => {
        l.style.color = '';
        l.style.background = '';
      });
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) {
        active.style.color = 'var(--yellow)';
        active.style.background = 'rgba(245,196,0,0.08)';
      }
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObs.observe(s));

// ═══ CONTADORES ANIMADOS ═══
function animateCounter(el) {
  const target = +el.dataset.target;
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = Date.now();

  const tick = () => {
    const elapsed  = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObs.observe(el));

// ═══ BACK TO TOP ═══
const btt = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  btt.classList.toggle('show', window.scrollY > 500);
}, { passive: true });
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ═══ FORMULARIO ═══
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const nombre   = document.getElementById('nombre');
    const telefono = document.getElementById('telefono');
    let valid = true;

    [nombre, telefono].forEach(f => {
      if (!f.value.trim()) {
        f.classList.add('err');
        valid = false;
      } else {
        f.classList.remove('err');
      }
    });
    if (!valid) { nombre.focus(); return; }

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    setTimeout(() => {
      form.querySelectorAll('input, textarea').forEach(f => f.value = '');
      form.querySelector('select').selectedIndex = 0;
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar consulta';
      document.getElementById('formSuccess').classList.add('show');
    }, 1400);
  });

  form.querySelectorAll('input, textarea').forEach(f => {
    f.addEventListener('input', () => f.classList.remove('err'));
  });
}

// ═══ EFECTO HOVER EN TARJETAS (aura de color) ═══
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});
