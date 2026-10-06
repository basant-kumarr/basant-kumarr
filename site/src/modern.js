/* Page behaviour and the hero intelligence field.
   Everything here is enhancement. The page is complete without it. */

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- theme ----------
   Dark by default. The choice is remembered per browser, and a stored value
   wins over the system preference. */
const THEME_KEY = 'bk-theme';
const root = document.documentElement;

const readStored = () => {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
};
const applyTheme = (theme) => {
  if (theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
  const btn = document.getElementById('themeToggle');
  if (btn) {
    const light = theme === 'light';
    btn.setAttribute('aria-pressed', String(light));
    btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }
};

// Dark is the primary identity. Light is available, but only when the visitor
// asks for it, so the first impression is the one that was designed.
applyTheme(readStored() === 'light' ? 'light' : 'dark');

const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode */ }
  });
}

/* ---------- mobile menu ---------- */
const menu = document.querySelector('.menu');
const navLinks = document.querySelector('.nav-links');
if (menu && navLinks) {
  const setOpen = (open) => {
    navLinks.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menu.addEventListener('click', () => setOpen(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      setOpen(false);
      menu.focus();
    }
  });
}

/* ---------- section reveal ----------
   Content is visible by default. It is only hidden once JS has taken control,
   so a script that fails to load can never leave the page blank. */
const revealables = Array.from(document.querySelectorAll('.reveal'));
const revealAll = () => revealables.forEach((el) => el.classList.add('in'));

if (reduceMotion || !('IntersectionObserver' in window) || !revealables.length) {
  revealAll();
} else {
  document.documentElement.classList.add('anim');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  revealables.forEach((el) => io.observe(el));
  setTimeout(revealAll, 3000);   // failsafe: never leave content hidden
}

/* ---------- sticky nav ---------- */
const nav = document.querySelector('.site-nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- active section in nav ---------- */
const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));
if (navAnchors.length && 'IntersectionObserver' in window) {
  const targets = navAnchors
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) => {
        const match = a.getAttribute('href') === '#' + entry.target.id;
        if (match) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  targets.forEach((t) => io.observe(t));
}

/* ---------- hero intelligence field ----------
   Lazily imported so its code never sits in the initial bundle, and only
   mounted once the hero is on screen. The canvas is decoration: the hero is
   complete text without it, and it needs no WebGL. */
const globeCanvas = document.getElementById('heroGlobe');
if (globeCanvas) {
  const small = window.matchMedia('(max-width: 900px)').matches;
  const mount = () => {
    import('./globe.js')
      .then((m) => m.initGlobe(globeCanvas, { reduced: reduceMotion, small }))
      .catch(() => {
        const shell = globeCanvas.closest('.hero-visual');
        if (shell) shell.classList.add('globe-failed');
      });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { obs.disconnect(); mount(); }
    }, { rootMargin: '150px' });
    io.observe(globeCanvas);
  } else {
    mount();
  }
}
