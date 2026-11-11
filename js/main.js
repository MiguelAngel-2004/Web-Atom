/* Montajes Industriales ATOM — main.js */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* Año en el pie */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Sombra de la cabecera al hacer scroll */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Menú móvil */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
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

  /* Aparición suave de bloques (una sola vez) */
  var targets = document.querySelectorAll('.section-head, .services li, .checklist, .works, .credentials, .steps, .form');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  /* Formulario de contacto (Formspree) */
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
