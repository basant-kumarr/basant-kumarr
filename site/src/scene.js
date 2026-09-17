/* Page level atmosphere: a quiet depth field behind the content, plus the
   pointer and scroll responses that give sections a sense of space.
   All of it is decoration. Nothing here carries information. */

import { TAU, fitCanvas, createLoop, finePointer } from './proj.js';

/* ---------- ambient depth field ---------- */

export function initAmbient(canvas, { reduced = false, small = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const COUNT = small ? 34 : 78;
  let w = 0, h = 0;
  const pts = [];

  function seed() {
    pts.length = 0;
    for (let i = 0; i < COUNT; i++) {
      const depth = 0.25 + Math.random() * 0.75;   // 1 = near
      pts.push({
        x: Math.random(),
        y: Math.random(),
        depth,
        r: 0.5 + depth * 1.5,
        vx: (Math.random() - 0.5) * 0.012 * depth,
        vy: (-0.006 - Math.random() * 0.012) * depth,
        tw: Math.random() * TAU
      });
    }
  }

  function resize() {
    const m = fitCanvas(canvas, ctx, 1.75);
    if (!m) return false;
    w = m.w; h = m.h;
    if (!pts.length) seed();
    return true;
  }

  let t = 0;
  let acc = 0;
  const STEP = 1 / 30;   // the field drifts slowly; 30fps is indistinguishable

  function draw(dt) {
    if (!w) return;
    if (!reduced) {
      acc += dt;
      if (acc < STEP) return;
      dt = acc;
      acc = 0;
    }
    t += dt;
    ctx.clearRect(0, 0, w, h);

    for (const p of pts) {
      if (!reduced) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x < -0.05) p.x = 1.05;
        else if (p.x > 1.05) p.x = -0.05;
      }
      const sx = p.x * w, sy = p.y * h;
      const twinkle = reduced ? 1 : 0.72 + Math.sin(t * 0.8 + p.tw) * 0.28;
      ctx.fillStyle = `rgba(56,189,248,${(0.05 + p.depth * 0.22) * twinkle})`;
      ctx.beginPath();
      ctx.arc(sx, sy, p.r, 0, TAU);
      ctx.fill();
    }

    // Occasional faint links between near neighbours, kept short so the field
    // reads as depth rather than as a mesh.
    const maxD = small ? 92 : 128;
    const LINKABLE = Math.min(pts.length, 44);   // cap the pairwise search
    ctx.lineWidth = 0.5;
    for (let i = 0; i < LINKABLE; i++) {
      const a = pts[i];
      if (a.depth < 0.6) continue;
      for (let j = i + 1; j < LINKABLE; j++) {
        const b = pts[j];
        if (b.depth < 0.6) continue;
        const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h;
        const d = Math.hypot(dx, dy);
        if (d > maxD) continue;
        ctx.strokeStyle = `rgba(56,189,248,${(0.055 * (1 - d / maxD)).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      }
    }
  }

  if (!resize()) requestAnimationFrame(() => resize());
  const loop = createLoop(canvas, draw, { reduced });

  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (resize()) draw(0); }, 200);
  };
  window.addEventListener('resize', onResize, { passive: true });

  return { destroy() { loop.destroy(); window.removeEventListener('resize', onResize); } };
}

/* ---------- card tilt ---------- */

export function initTilt(selector, { reduced = false } = {}) {
  if (reduced || !finePointer()) return null;
  const cards = Array.from(document.querySelectorAll(selector));
  if (!cards.length) return null;

  const MAX = 3.4; // degrees. Restraint is the whole point.
  const handlers = [];

  cards.forEach((card) => {
    let raf = 0;
    let tx = 0, ty = 0;

    const apply = () => {
      raf = 0;
      card.style.transform = `perspective(1100px) rotateX(${ty}deg) rotateY(${tx}deg) translateZ(0)`;
    };

    const move = (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tx = nx * MAX * 2;
      ty = -ny * MAX * 2;
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const leave = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      card.style.transform = '';
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    };

    card.addEventListener('pointermove', move, { passive: true });
    card.addEventListener('pointerleave', leave, { passive: true });
    handlers.push([card, move, leave]);
  });

  return {
    destroy() {
      handlers.forEach(([c, m, l]) => {
        c.removeEventListener('pointermove', m);
        c.removeEventListener('pointerleave', l);
      });
    }
  };
}

/* ---------- scroll parallax ---------- */

export function initParallax({ reduced = false } = {}) {
  if (reduced) return null;
  const items = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!items.length) return null;

  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const centre = r.top + r.height / 2;
      const off = (centre - vh / 2) / vh;          // -1 .. 1 through viewport
      const amt = parseFloat(el.dataset.parallax) || 10;
      el.style.transform = `translate3d(0, ${(off * amt).toFixed(2)}px, 0)`;
    }
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  return {
    destroy() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
}
