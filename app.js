(function () {
  var nav = document.querySelector('header.nav');
  var bar = document.querySelector('.progress');
  var glow = document.querySelector('.glow');
  var solidAlways = document.body.classList.contains('no-hero');

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('solid', solidAlways || y > 60);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // menu téléphone
  var burger = document.querySelector('.burger');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    nav.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  }

  if (glow && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      glow.style.opacity = 1;
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  // titres découpés mot par mot
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var html = el.innerHTML.split(/(<[^>]+>[^<]*<\/[^>]+>|\s+)/).filter(Boolean);
    var i = 0;
    el.innerHTML = html.map(function (part) {
      if (/^\s+$/.test(part)) return ' ';
      return '<span class="split-word" style="transition-delay:' + (0.08 * i++) + 's">' + part + '</span>';
    }).join('');
  });

  // compteurs
  function count(el) {
    var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add('in');
      el.querySelectorAll('.split-word').forEach(function (w) { w.classList.add('in'); });
      if (el.dataset.count) count(el);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.rv,[data-count],.tl,[data-split],.promise,.split2,.days,.chapters,.cmp2,.bx-time,.bx-google,.bx-own,.audit,.ex').forEach(function (el) { io.observe(el); });

  // écrans qui défilent
  function feed(img) {
    var box = img.parentElement, end = box.clientHeight - img.clientHeight;
    if (end < 0) {
      img.style.setProperty('--end', end + 'px');
      img.style.setProperty('--dur', Math.max(10, Math.round(-end / 55)) + 's');
    }
  }
  document.querySelectorAll('.feed img').forEach(function (img) {
    if (img.complete) feed(img); else img.addEventListener('load', function () { feed(img); });
  });
  window.addEventListener('resize', function () { document.querySelectorAll('.feed img').forEach(feed); });


  // méthode : l'étape avance avec le défilement
  var story = document.querySelector('.story');
  if (story) {
    var dts = story.querySelectorAll('.rail .dt'), txt = story.querySelectorAll('.txt-p'), vis = story.querySelectorAll('.vis'),
        fill = story.querySelector('.fillv'), n = txt.length, last = -1;
    function upd() {
      if (window.innerWidth < 980) return;
      var r = story.getBoundingClientRect(), span = story.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / span));
      var i = Math.min(n - 1, Math.floor(p * n));
      if (fill) fill.style.height = (p * 100) + '%';
      if (i === last) return; last = i;
      txt.forEach(function (e, k) { e.classList.toggle('cur', k === i); });
      vis.forEach(function (e, k) { e.classList.toggle('cur', k === i); });
      dts.forEach(function (e, k) { e.classList.toggle('done', k <= i); e.classList.toggle('cur', k === i); });
    }
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }


  // auto-audit : score
  document.querySelectorAll('.selfaudit').forEach(function (box) {
    var boxes = box.querySelectorAll('input'), n = boxes.length, ring = box.querySelector('.ring .p'), lab = box.querySelector('.sa-n'), msg = box.querySelector('.sa-msg');
    function sc() {
      var k = 0; boxes.forEach(function (b) { if (b.checked) k++; });
      lab.textContent = k + '/' + n; ring.style.strokeDashoffset = 408 - 408 * k / n;
      msg.textContent = k === 0 ? 'Cochez les cases pour voir votre score.' : k === n ? 'Bravo, vous êtes au top ! Un audit peut confirmer les détails.' : k >= n * 0.6 ? 'Bonne base ! Il reste quelques points faciles à améliorer.' : 'Il y a de belles marges de progression : un audit vous dira par où commencer.';
    }
    boxes.forEach(function (b) { b.addEventListener('change', sc); });
  });

  // contact : demande d’audit
  var ft = document.getElementById('ftype');
  if (ft) {
    function setType() {
      var a = ft.value === 'audit';
      document.getElementById('ftitle').textContent = a ? 'Demander mon audit' : ft.value === 'question' ? 'Poser ma question' : 'Recevoir ma maquette gratuite';
      document.getElementById('furl').style.display = a ? '' : 'none';
      document.getElementById('fbtn').textContent = a ? 'Je demande mon audit' : ft.value === 'question' ? 'Envoyer ma question' : 'Recevoir ma maquette gratuite';
    }
    if (location.hash === '#audit') ft.value = 'audit';
    ft.addEventListener('change', setType); setType();
  }

  // contact : envoi sans quitter la page
  var fc = document.getElementById('fcontact');
  if (fc && window.fetch) {
    fc.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = fc.querySelector('button[type=submit]');
      btn.disabled = true; document.getElementById('fbtn').textContent = 'Envoi en cours…';
      function done() { fc.hidden = true; document.getElementById('fok').hidden = false; }
      // si l'envoi discret échoue, le formulaire part normalement (page FormSubmit puis retour ici)
      fetch(fc.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', body: new FormData(fc), headers: { Accept: 'application/json' } })
        .then(function (r) { if (r.ok) done(); else fc.submit(); }, function () { fc.submit(); });
    });
  }

  // filtres
  document.querySelectorAll('.filters').forEach(function (f) {
    f.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      f.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      var c = b.dataset.c, scope = document.querySelector(f.dataset.target);
      scope.querySelectorAll('[data-cat]').forEach(function (el) {
        el.classList.toggle('hide', !(c === 'tout' || el.dataset.cat === c));
      });
    });
  });
})();
