/* Montajes Industriales ATOM — main.js */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* Año en el pie */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── Línea eléctrica de la portada ───────────────────────── */
  (function buildPowerLine() {
    var box = document.getElementById('hero-line');
    if (!box) return;
    var NS = 'http://www.w3.org/2000/svg';
    var GROUND = 240, SAG = 34;
    var towers = [180, 560, 940, 1320];
    var all = [-200].concat(towers, [1700]);

    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    }
    function towerPath(c) {
      var d = '';
      d += 'M' + (c - 28) + ' ' + GROUND + 'L' + (c - 7) + ' 70L' + c + ' 48L' + (c + 7) + ' 70L' + (c + 28) + ' ' + GROUND;
      d += 'M' + (c - 52) + ' 86L' + (c + 52) + ' 86M' + (c - 40) + ' 122L' + (c + 40) + ' 122';
      d += 'M' + (c - 52) + ' 86L' + (c - 8) + ' 100M' + (c + 52) + ' 86L' + (c + 8) + ' 100';
      d += 'M' + (c - 40) + ' 122L' + (c - 11) + ' 134M' + (c + 40) + ' 122L' + (c + 11) + ' 134';
      d += 'M' + (c - 52) + ' 86v10M' + (c + 52) + ' 86v10M' + (c - 40) + ' 122v10M' + (c + 40) + ' 122v10';
      /* celosía */
      var ys = [GROUND, 205, 172, 142, 116, 92, 70];
      ys.forEach(function (y, i) {
        var half = 7 + 21 * (y - 70) / (GROUND - 70);
        var x = i % 2 ? c + half : c - half;
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y;
      });
      return d;
    }
    function cablePath(dx, y) {
      var d = 'M' + (all[0] + dx) + ' ' + y;
      for (var i = 1; i < all.length; i++) {
        var mid = (all[i - 1] + all[i]) / 2 + dx;
        d += 'Q' + mid + ' ' + (y + SAG * 2) + ' ' + (all[i] + dx) + ' ' + y;
      }
      return d;
    }

    var svg = el('svg', { viewBox: '0 0 1440 240', preserveAspectRatio: 'xMidYMax slice', focusable: 'false' });
    svg.appendChild(el('line', { x1: 0, y1: GROUND - .5, x2: 1440, y2: GROUND - .5, class: 'ground' }));

    towers.forEach(function (c, i) {
      var p = el('path', { d: towerPath(c), class: 'tower' });
      p.style.transitionDelay = (i * 0.15) + 's';
      svg.appendChild(p);
    });

    var lines = [
      { dx: -52, y: 96,  color: '#F5C400', t: 4.5 },
      { dx:  52, y: 96,  color: '#ff3b47', t: 5.5 },
      { dx: -40, y: 132, color: '#2fe07a', t: 5 },
      { dx:  40, y: 132, color: '#5aa0ff', t: 6 }
    ];
    lines.forEach(function (l, i) {
      var d = cablePath(l.dx, l.y);
      var cable = el('path', { d: d, class: 'cable', pathLength: 1 });
      cable.style.transitionDelay = (0.5 + i * 0.12) + 's';
      svg.appendChild(cable);
      /* dos impulsos por cable, cada uno con halo + núcleo brillante */
      [0, 0.5].forEach(function (phase) {
        ['pulse pulse-glow', 'pulse'].forEach(function (cls) {
          var p = el('path', { d: d, class: cls, pathLength: 1, stroke: l.color });
          p.style.setProperty('--t', l.t + 's');
          p.style.setProperty('--dl', (-(phase + i * 0.17) * l.t).toFixed(2) + 's');
          svg.appendChild(p);
        });
      });
    });

    box.appendChild(svg);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { box.classList.add('is-on'); });
    });
    if (!reduce) setTimeout(function () { box.classList.add('is-live'); }, 1500);
  })();

  /* ── Contadores ──────────────────────────────────────────── */
  function countUp(node, from, to, ms) {
    if (reduce) { node.textContent = to; return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / ms, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('[data-count]').forEach(function (n) {
    var to = parseInt(n.getAttribute('data-count'), 10);
    n.textContent = '0';
    setTimeout(function () { countUp(n, 0, to, 1400); }, 600);
  });

  /* ── Cabecera: sombra y ocultar al bajar ─────────────────── */
  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  if (header) {
    var lastY = window.scrollY;
    var onScroll = function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 10);
      var menuOpen = nav && nav.classList.contains('is-open');
      header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 300);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Menú móvil ──────────────────────────────────────────── */
  var burger = document.getElementById('burger');
  if (burger && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ── Apariciones al hacer scroll ─────────────────────────── */
  var revealSel = '.section-head, .services li, .checklist li, .charge, .works tbody tr, .credentials, .steps li, .zones, .form, .contact-list, .cta-inner';
  var charge = document.getElementById('charge');

  function onEnter(node) {
    node.classList.add('is-in');
    if (node === charge) {
      var pct = document.getElementById('charge-pct');
      if (pct) countUp(pct, 20, 80, 3200);
    }
  }

  if (hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { onEnter(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll(revealSel).forEach(function (node) {
      /* escalonado entre hermanos del mismo tipo */
      var sibs = Array.prototype.filter.call(node.parentNode.children, function (s) { return s.tagName === node.tagName; });
      var idx = sibs.indexOf(node);
      if (sibs.length > 1 && idx > 0) node.style.setProperty('--d', Math.min(idx * 0.07, 0.5) + 's');
      node.classList.add('reveal');
      io.observe(node);
    });
    document.querySelectorAll('.section h2').forEach(function (h) { io.observe(h); });
  } else {
    document.querySelectorAll(revealSel + ', .section h2').forEach(onEnter);
  }

  /* ── Formulario de contacto (Formspree) ──────────────────── */
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  /* Sustituir XXXXXXXX por el ID real de Formspree */
  var ENDPOINT = 'https://formspree.io/f/XXXXXXXX';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    var invalid = null;
    form.querySelectorAll('[required]').forEach(function (field) {
      var label = field.closest('label');
      var ok = field.type === 'checkbox' ? field.checked : field.checkValidity() && field.value.trim() !== '';
      if (label) label.classList.toggle('is-invalid', !ok);
      if (!ok && !invalid) invalid = field;
    });
    if (invalid) {
      status.className = 'form-status err';
      status.textContent = 'Revisa los campos marcados.';
      invalid.focus();
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    fetch(ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(function (res) {
        if (!res.ok) throw new Error();
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Gracias. Hemos recibido tu consulta y te responderemos lo antes posible.';
      })
      .catch(function () {
        status.className = 'form-status err';
        status.textContent = 'No se ha podido enviar. Llámanos al 649 757 473 o escribe a electrotex@electrotex.es.';
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = 'Enviar consulta';
      });
  });
})();
