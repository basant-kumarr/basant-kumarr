/* Page behaviour: menu, active section, reveal, portrait, and scene mounting.
   Content never depends on this file: with JavaScript off every section is
   still visible and every link still works. */
(function () {
  'use strict';
  var BK = window.BK;
  var doc = document.documentElement;
  doc.classList.add('js');

  /* menu */
  var btn = document.getElementById('menuBtn'), links = document.getElementById('navLinks');
  function closeMenu() { links.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); }
  btn.addEventListener('click', function () {
    var open = !links.classList.contains('open');
    links.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && links.classList.contains('open')) { closeMenu(); btn.focus(); } });

  /* active section in the nav */
  var navA = Array.prototype.slice.call(links.querySelectorAll('a'));
  var secs = navA.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function setActive() {
    var y = window.scrollY + window.innerHeight * 0.35, cur = 0;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = secs.length - 1;
    navA.forEach(function (a, i) {
      a.classList.toggle('active', i === cur);
      if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* reveal, with a failsafe so nothing can stay hidden */
  var rev = document.querySelectorAll('.sec-head, .panel, .footnote');
  if ('IntersectionObserver' in window && !BK.reduced) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (el) { if (!el.closest('#home')) { el.setAttribute('data-reveal', ''); io.observe(el); } });
    setTimeout(function () { rev.forEach(function (el) { el.classList.add('in'); }); }, 3500);
  }

  /* portrait: shown only if assets/img/portrait.jpg exists, otherwise the monogram */
  var img = document.getElementById('portraitImg');
  if (img) {
    var host = img.closest('.portrait');
    var ok = function () { if (img.naturalWidth > 0) host.classList.add('has-photo'); };
    if (img.complete) ok(); else img.addEventListener('load', ok);
    img.addEventListener('error', function () { img.remove(); });
  }

  /* fixed starfield, drawn once per resize */
  var sky = document.getElementById('sky');
  function paintSky() {
    var c = sky.getContext('2d'); if (!c) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = window.innerWidth, h = window.innerHeight;
    sky.width = w * dpr; sky.height = h * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var R = BK.rng(3), n = Math.round(w * h / 2600), pts = [];
    for (var i = 0; i < n; i++) {
      var x = R() * w, y = R() * h, z = R();
      pts.push([x, y]);
      c.fillStyle = 'rgba(' + (z > .8 ? '200,225,255' : '120,170,255') + ',' + (0.15 + z * 0.55).toFixed(2) + ')';
      var s = z > .93 ? 1.8 : z > .6 ? 1.1 : 0.7;
      c.fillRect(x, y, s, s);
    }
    c.strokeStyle = 'rgba(70,140,255,0.07)'; c.lineWidth = 0.6; c.beginPath();
    for (i = 0; i < pts.length; i += 2) {
      for (var j = i + 1; j < Math.min(pts.length, i + 40); j++) {
        var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
        if (dx * dx + dy * dy < 9000) { c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[j][0], pts[j][1]); }
      }
    }
    c.stroke();
  }
  if (sky) {
    paintSky();
    var lastW = window.innerWidth, t0 = 0;
    window.addEventListener('resize', function () {
      clearTimeout(t0);
      t0 = setTimeout(function () { if (Math.abs(window.innerWidth - lastW) > 40) { lastW = window.innerWidth; paintSky(); } }, 200);
    });
  }

  /* scenes */
  var map = {
    cvBrain: 'brain', cvRing: 'ring', cvBody: 'body', cvIreland: 'ireland', cvFraud: 'fraud',
    cvForecast: 'forecast', cvSkills: 'skills', cvCity: 'city', cvPath: 'path', cvGlobe: 'globe'
  };
  Object.keys(map).forEach(function (id) {
    var cv = document.getElementById(id), f = BK.scenes[map[id]];
    if (cv && f) BK.mount(cv, f);
  });
})();
