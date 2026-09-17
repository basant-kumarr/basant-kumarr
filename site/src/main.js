/* Basant Kumar portfolio
   Progressive enhancement only. Every piece of content is already in the HTML.
   Nothing here supplies content, it only adds behaviour. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsIO = 'IntersectionObserver' in window;

/* ---------- sticky header shadow ---------- */
const header = document.getElementById('siteHeader');
if (header) {
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- mobile menu ---------- */
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggle && mobileMenu) {
  const setMenu = (open) => {
    mobileMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  navToggle.addEventListener('click', () => {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      navToggle.focus();
    }
  });
}

/* ---------- counters ----------
   The real value is already rendered in the HTML. This animates up to it and then
   restores the exact original string, so the number on screen can never disagree
   with the markup. Skipped entirely under reduced motion. */
const counters = document.querySelectorAll('.stat-value[data-count]');

const runCounter = (el) => {
  if (el.dataset.done === '1') return;
  el.dataset.done = '1';

  const original = el.textContent;
  const target = parseFloat(el.dataset.count);
  if (!isFinite(target)) return;

  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1100;
  const start = performance.now();

  const frame = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = target * eased;
    el.textContent =
      value.toLocaleString('en-IE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = original; // authoritative value wins
    }
  };
  requestAnimationFrame(frame);
};

if (counters.length && !reduceMotion && supportsIO) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => io.observe(el));
}

/* ---------- project detail panels ---------- */
document.querySelectorAll('[data-expand]').forEach((btn) => {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  if (!panel) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    const label = btn.textContent.trim();
    if (open && !btn.dataset.closedLabel) btn.dataset.closedLabel = label;
    btn.textContent = open ? 'Hide details' : (btn.dataset.closedLabel || 'Project details');
  };

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    setOpen(!open);
    if (!open) {
      const heading = panel.querySelector('h4');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  });

  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      btn.focus();
    }
  });
});

/* Deep link: /#bebeyond opens that project. */
const openFromHash = () => {
  const id = location.hash.replace('#', '');
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  const btn = target.querySelector('[data-expand]');
  if (btn && btn.getAttribute('aria-expanded') !== 'true') btn.click();
};
window.addEventListener('hashchange', openFromHash);
openFromHash();

/* ---------- skill tabs ---------- */
const tabs = Array.from(document.querySelectorAll('.skill-tab'));

if (tabs.length) {
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));

  const select = (index, focusTab = true) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (panels[i]) panels[i].hidden = !active;
    });
    if (focusTab) tabs[index].focus();
  };

  // Establish roving tabindex from the markup's initial selection.
  const initial = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  tabs.forEach((tab, i) => { tab.tabIndex = i === initial ? 0 : -1; });

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) { e.preventDefault(); select(next); }
    });
  });
}

/* ---------- scroll reveal ---------- */
const revealables = document.querySelectorAll('.reveal');

const revealAll = () => revealables.forEach((el) => el.classList.add('is-in'));

if (reduceMotion || !supportsIO || !revealables.length) {
  // Never opt into the hidden state at all.
  revealAll();
} else {
  // Only now is it safe to let CSS hide anything.
  document.documentElement.classList.add('anim');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealables.forEach((el) => io.observe(el));

  // Failsafe. If anything stops the observer firing, content still appears.
  // Off-screen elements reveal invisibly, so this costs the user nothing.
  setTimeout(revealAll, 3000);
}

/* ---------- hero globe ----------
   Lazy loaded so its code never sits in the initial bundle, and only mounted
   when the hero is actually on screen. Decorative: the hero is complete text
   without it. */
const globeCanvas = document.getElementById('heroGlobe');

if (globeCanvas) {
  const small = window.matchMedia('(max-width: 979px)').matches;

  const mount = () => {
    import('./globe.js')
      .then((m) => m.initGlobe(globeCanvas, { reduced: reduceMotion, small }))
      .catch(() => { globeCanvas.style.display = 'none'; });
  };

  if (supportsIO) {
    const gio = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        obs.disconnect();
        mount();
      }
    }, { rootMargin: '120px' });
    gio.observe(globeCanvas);
  } else {
    mount();
  }
}

/* ---------- spatial layer ----------
   Ambient field, skills constellation, project motifs, card tilt and parallax.
   Every piece is lazily imported and purely decorative. */

const smallScreen = window.matchMedia('(max-width: 859px)').matches;

/* Ambient depth field, page wide. */
const bgField = document.getElementById('bgField');
if (bgField) {
  import('./scene.js')
    .then((m) => {
      m.initAmbient(bgField, { reduced: reduceMotion, small: smallScreen });
      m.initTilt('.project', { reduced: reduceMotion });
      m.initParallax({ reduced: reduceMotion });
    })
    .catch(() => { bgField.style.display = 'none'; });
}

/* Skills constellation, mounted when the section comes into view. */
const skillField = document.getElementById('skillField');
if (skillField) {
  const mountField = () => {
    import('./constellation.js')
      .then((m) => m.initConstellation(skillField, {
        reduced: reduceMotion,
        small: window.matchMedia('(max-width: 759px)').matches
      }))
      .catch(() => {
        const box = skillField.closest('.constellation');
        if (box) box.style.display = 'none';
      });
  };
  if (supportsIO) {
    const io = new IntersectionObserver((en, obs) => {
      if (en.some((e) => e.isIntersecting)) { obs.disconnect(); mountField(); }
    }, { rootMargin: '200px' });
    io.observe(skillField);
  } else {
    mountField();
  }
}

/* Project motifs, each mounted as its card approaches. */
const motifCanvases = Array.from(document.querySelectorAll('canvas[data-motif]'));
if (motifCanvases.length) {
  let motifMod = null;
  const mountMotif = (cv) => {
    const run = (m) => m.initMotif(cv, cv.dataset.motif, { reduced: reduceMotion });
    if (motifMod) { run(motifMod); return; }
    import('./motifs.js')
      .then((m) => { motifMod = m; run(m); })
      .catch(() => {
        motifCanvases.forEach((c) => {
          const box = c.closest('.project-motif');
          if (box) box.style.display = 'none';
        });
      });
  };
  if (supportsIO) {
    const io = new IntersectionObserver((en, obs) => {
      en.forEach((e) => {
        if (e.isIntersecting) { obs.unobserve(e.target); mountMotif(e.target); }
      });
    }, { rootMargin: '250px' });
    motifCanvases.forEach((c) => io.observe(c));
  } else {
    motifCanvases.forEach(mountMotif);
  }
}

/* ---------- active nav section ---------- */
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));

if (navLinks.length && supportsIO) {
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        const match = a.getAttribute('href') === '#' + entry.target.id;
        if (match) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((s) => io.observe(s));
}
