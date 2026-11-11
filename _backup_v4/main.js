/* ================================================================
   MONTAJES INDUSTRIALES ATOM — main.js  v4.0
   Motor único: GSAP. Sin conflictos de animación.
   Sin CSS IntersectionObserver compitiendo con GSAP.
   ================================================================ */

/* ── GSAP INIT ──────────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* Esperar a que el DOM esté listo antes de inicializar todo */
document.addEventListener('DOMContentLoaded', init);

function init() {
  setupCursor();
  setupNavbar();
  setupSmoothScroll();
  setupScrollAnimations();
  setupPortfolioFilter();
  setupContactForm();
  setupHeroVisualParallax();
}

/* ── LOADER ─────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;

  /* El loader se oculta 2.7s después de que todo haya cargado.
     Esto sincroniza con la animación de la barra CSS (2.6s). */
  gsap.to(loader, {
    opacity: 0,
    duration: 0.55,
    delay: 2.7,
    ease: 'power2.inOut',
    onComplete: () => {
      loader.classList.add('is-hidden');
      /* Entrada del hero solo cuando el loader desaparece */
      animateHeroEntrance();
    }
  });
});

/* ── CURSOR ─────────────────────────────────────────────────── */
function setupCursor() {
  const cur  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-follower');
  if (!cur || !ring) return;

  /* Usar transform (no top/left) → sin reflow */
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    /* Dot sigue el cursor inmediatamente */
    cur.style.transform = `translate(${mx - 3.5}px, ${my - 3.5}px)`;
  }, { passive: true });

  /* Ring sigue con lerp suave — dentro de rAF, no en mousemove */
  (function trackRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.transform = `translate(${rx - 13}px, ${ry - 13}px)`;
    requestAnimationFrame(trackRing);
  })();

  /* Hover state en elementos interactivos */
  const interactiveSelectors = 'a, button, .svc-card, .port-card, .cert-card, .testimonial-card, .feat, .ev-feat';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hovered'));
  });
}

/* ── NAVBAR ─────────────────────────────────────────────────── */
function setupNavbar() {
  const nav     = document.getElementById('navbar');
  const backTop = document.getElementById('back-top');
  const burger  = document.getElementById('burger');
  const overlay = document.getElementById('mobile-overlay');
  if (!nav) return;

  /* Scroll: scrolled state + back-to-top visibility */
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 60);
    if (backTop) backTop.classList.toggle('is-visible', y > 500);
  }, { passive: true });

  /* Mobile menu */
  if (!burger || !overlay) return;
  let isOpen = false;

  function toggleMenu(forceState) {
    isOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
    burger.classList.toggle('is-open', isOpen);
    overlay.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  burger.addEventListener('click', () => toggleMenu());

  /* Cerrar al pulsar un enlace del menú móvil */
  overlay.querySelectorAll('.mobile-nav-link, .btn').forEach(el => {
    el.addEventListener('click', () => toggleMenu(false));
  });

  /* Cerrar con Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) toggleMenu(false);
  });
}

/* ── SMOOTH SCROLL con offset de navbar ─────────────────────── */
function setupSmoothScroll() {
  const NAVBAR_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || '70'
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const hash = anchor.getAttribute('href');
      if (hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* ── HERO ENTRANCE (GSAP — motor único) ─────────────────────── */
function animateHeroEntrance() {
  /* Comprobar si hay elementos del hero antes de animar */
  const eyebrow = document.querySelector('.hero-eyebrow');
  const title   = document.querySelector('.hero-title');
  if (!eyebrow || !title) return;

  /* Establecer estado inicial antes de la animación */
  gsap.set([
    '.hero-eyebrow', '.hero-title', '.hero-desc',
    '.hero-ctas > *', '.hero-rating', '.hero-visual', '.hv-float'
  ], { opacity: 0 });

  gsap.set('.hero-stripe', { scaleX: 0, transformOrigin: 'left center' });
  gsap.set('.hero-scroll-hint', { opacity: 0, y: -10 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-eyebrow',     { opacity: 1, y: 0, duration: 0.6,  from: { y: 20 } })
    .to('.hero-title',       { opacity: 1, y: 0, duration: 0.8,  from: { y: 40 } }, '-=0.35')
    .to('.hero-desc',        { opacity: 1, y: 0, duration: 0.7,  from: { y: 25 } }, '-=0.5')
    .to('.hero-ctas > *',    { opacity: 1, y: 0, duration: 0.5,  stagger: 0.12, from: { y: 20 } }, '-=0.4')
    .to('.hero-rating',      { opacity: 1, y: 0, duration: 0.5,  from: { y: 15 } }, '-=0.3')
    .to('.hero-visual',      { opacity: 1, x: 0, duration: 0.9,  ease: 'power2.out', from: { x: 40 } }, '-=1.2')
    .to('.hv-float',         { opacity: 1, y: 0, duration: 0.5,  stagger: 0.15, from: { y: 20 } }, '-=0.4')
    .to('.hero-stripe',      { scaleX: 1,  duration: 0.8,  ease: 'power2.inOut' }, '-=0.6')
    .to('.hero-scroll-hint', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');
}

/* ── HERO VISUAL PARALLAX (container, no órbitas) ───────────── */
/* Mover el contenedor .hero-visual con el ratón.
   Las órbitas CSS animan dentro de él sin interferencia. */
function setupHeroVisualParallax() {
  const visual    = document.querySelector('.hero-visual');
  const heroSection = document.getElementById('hero');
  if (!visual || !heroSection) return;

  /* Solo en dispositivos con ratón (pointer: fine) */
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let tX = 0, tY = 0, cX = 0, cY = 0;
  let rafId = null;

  heroSection.addEventListener('mousemove', e => {
    const r = heroSection.getBoundingClientRect();
    tX = ((e.clientX - r.left) / r.width  - 0.5) * 18;
    tY = ((e.clientY - r.top)  / r.height - 0.5) * 12;
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => { tX = 0; tY = 0; });

  function loop() {
    cX += (tX - cX) * 0.06;
    cY += (tY - cY) * 0.06;
    /* Solo actualizar si hay movimiento real */
    if (Math.abs(tX - cX) > 0.01 || Math.abs(tY - cY) > 0.01 || Math.abs(cX) > 0.01 || Math.abs(cY) > 0.01) {
      visual.style.transform = `translate(${cX}px, ${cY}px)`;
    }
    rafId = requestAnimationFrame(loop);
  }

  /* Activar solo cuando el hero está visible — ahorra batería */
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!rafId) rafId = requestAnimationFrame(loop);
    } else {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      visual.style.transform = '';
    }
  });
  obs.observe(heroSection);
}

/* ── PARALLAX HERO CONTENT al hacer scroll ──────────────────── */
/* Efecto fade-out del contenido del hero mientras scrolleas */
(function setupHeroScrollFade() {
  const hc = document.querySelector('.hero-content-side');
  if (!hc || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  const vh = window.innerHeight;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const s = window.scrollY;
      if (s < vh * 1.5) {
        const progress = Math.min(s / vh, 1);
        hc.style.transform = `translateY(${s * 0.14}px)`;
        hc.style.opacity   = `${Math.max(0, 1 - progress * 1.4)}`;
      } else {
        hc.style.transform = '';
        hc.style.opacity   = '';
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ── SCROLL ANIMATIONS (GSAP — motor único) ─────────────────── */
function setupScrollAnimations() {
  /* Helper: anima un grupo de elementos con stagger */
  function fromGroup(selector, trigger, vars = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.from(els, {
      scrollTrigger: {
        trigger: trigger || els[0],
        start: 'top 82%',
        once: true        /* No re-anima al volver a subir */
      },
      y: 40, opacity: 0, duration: 0.55, stagger: 0.09, ease: 'power2.out',
      ...vars
    });
  }

  /* Helper: anima un elemento individual */
  function fromOne(selector, trigger, vars = {}) {
    const el = document.querySelector(selector);
    if (!el) return;
    gsap.from(el, {
      scrollTrigger: { trigger: trigger || el, start: 'top 82%', once: true },
      y: 35, opacity: 0, duration: 0.7, ease: 'power2.out',
      ...vars
    });
  }

  /* Títulos de sección */
  document.querySelectorAll('.section-h2').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      y: 28, opacity: 0, duration: 0.65, ease: 'power2.out'
    });
  });

  /* Trust bar */
  fromGroup('.trust-item', '.trust-bar', { y: 20, stagger: 0.08 });

  /* About */
  fromOne('.about-card', '#about', { x: -40, y: 0 });
  fromGroup('.feat', '.feat-list', { x: -20, y: 0, stagger: 0.1 });

  /* Servicios */
  fromGroup('.svc-card', '#services', { y: 45, stagger: 0.09 });

  /* Electrogasolineras */
  fromOne('.electro-visual', '#electrogasolineras', { scale: 0.95, y: 0 });
  fromGroup('.ev-feat', '.ev-feat-grid', { y: 35, stagger: 0.1 });
  fromOne('.ev-cta-box', '#electrogasolineras', { y: 25 });

  /* Certificaciones */
  fromGroup('.cert-card', '#certificaciones', { y: 35, stagger: 0.1 });
  fromOne('.cert-auditors', '#certificaciones', { y: 20 });

  /* Medio ambiente */
  fromOne('.eco-visual', '#medioambiente', { scale: 0.95, y: 0 });
  fromGroup('.eco-pillar', '.eco-pillars', { x: -20, y: 0, stagger: 0.1 });

  /* Proceso */
  fromGroup('.process-step', '.process-grid', { y: 35, stagger: 0.15 });

  /* Portfolio */
  fromGroup('.port-card', '.port-grid', { y: 35, stagger: 0.08 });

  /* Contacto */
  fromOne('.contact-card', '#contact', { x: -35, y: 0 });
  fromGroup('.ci-card', '.contact-info', { y: 20, stagger: 0.1 });
}

/* ── PORTFOLIO FILTER ────────────────────────────────────────── */
function setupPortfolioFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.port-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      /* Actualizar estado activo */
      btns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.f;

      /* Filtrar tarjetas con transición suave */
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.c === filter;
        card.style.transition = 'opacity .3s ease, transform .3s ease';
        card.style.opacity    = show ? '1' : '0.1';
        card.style.transform  = show ? '' : 'scale(0.94)';
        card.style.pointerEvents = show ? '' : 'none';
      });
    });
  });
}

/* ── CONTACTO — formulario ───────────────────────────────────── */
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    /* Validar GDPR */
    const gdprBox  = form.querySelector('#gdpr');
    const gdprWrap = form.querySelector('.form-gdpr');
    if (gdprBox && !gdprBox.checked) {
      gdprWrap.classList.add('is-invalid');
      gdprBox.focus();
      /* Quitar error al marcar */
      gdprBox.addEventListener('change', () => gdprWrap.classList.remove('is-invalid'), { once: true });
      return;
    }

    const btn  = form.querySelector('.submit-btn');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      /* Sustituir XXXXXXXX por tu ID de Formspree real */
      const res = await fetch('https://formspree.io/f/XXXXXXXX', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (res.ok) {
        btn.innerHTML    = '<i class="fas fa-check" style="margin-right:.35rem"></i>¡Enviado correctamente!';
        btn.style.background   = 'var(--clr-green)';
        btn.style.borderColor  = 'var(--clr-green)';
        form.reset();
        if (window.gtag) gtag('event', 'lead_form_submit', { event_category: 'conversion' });
        setTimeout(() => {
          btn.innerHTML        = orig;
          btn.style.background = '';
          btn.style.borderColor= '';
          btn.disabled         = false;
        }, 4000);
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.innerHTML = 'Error — inténtalo de nuevo';
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 3500);
    }
  });
}
