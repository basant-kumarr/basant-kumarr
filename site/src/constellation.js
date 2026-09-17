/* Skills constellation.
   Nodes are read out of the DOM the accessible skills list already renders, so
   the visual layer cannot drift from the semantic one. The canvas is decoration
   on top of that list, never a replacement for it. */

import { TAU, fibonacciSphere, makeProjector, fitCanvas, createLoop, finePointer } from './proj.js';

const CATEGORY_TINT = [
  [56, 189, 248],   // sky
  [34, 211, 238],   // cyan
  [129, 140, 248],  // indigo
  [96, 165, 250],   // blue
  [125, 211, 252]   // light sky
];

/** Orthonormal basis around a direction, for scattering points in a cap. */
function basis(d) {
  const a = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let u = [
    d[1] * a[2] - d[2] * a[1],
    d[2] * a[0] - d[0] * a[2],
    d[0] * a[1] - d[1] * a[0]
  ];
  let n = Math.hypot(u[0], u[1], u[2]) || 1;
  u = [u[0] / n, u[1] / n, u[2] / n];
  const v = [
    d[1] * u[2] - d[2] * u[1],
    d[2] * u[0] - d[0] * u[2],
    d[0] * u[1] - d[1] * u[0]
  ];
  return [u, v];
}

function readSkills() {
  const tabs = Array.from(document.querySelectorAll('.skill-tab'));
  return tabs.map((tab) => {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    const rows = panel ? Array.from(panel.querySelectorAll('.skill-row')) : [];
    const names = rows.map((row) => {
      const name = row.querySelector('.skill-name');
      const where = row.querySelector('.skill-where');
      // Node weight comes from the evidence already on the page: a skill used
      // in more places is drawn larger. Nothing invented.
      const places = where
        ? where.textContent.split(/,| and /).filter((x) => x.trim()).length
        : 1;
      return { name: name ? name.textContent.trim() : '', weight: Math.min(3, places) };
    }).filter((n) => n.name);
    return { label: tab.textContent.trim(), tabId: tab.id, names };
  }).filter((c) => c.names.length);
}

export function initConstellation(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const reduced = opts.reduced === true;
  const small = opts.small === true;
  const cats = readSkills();
  if (!cats.length) return null;

  const centers = fibonacciSphere(cats.length);
  const nodes = [];

  cats.forEach((cat, ci) => {
    const d = centers[ci];
    const [u, v] = basis(d);
    const spread = 0.62;
    cat.names.forEach((item, i) => {
      // Deterministic scatter inside a cap around the category direction.
      const a = spread * (0.28 + 0.72 * ((i * 0.618) % 1));
      const t = (i / cat.names.length) * TAU + ci * 1.7;
      const sa = Math.sin(a), ca = Math.cos(a);
      const p = [
        d[0] * ca + (u[0] * Math.cos(t) + v[0] * Math.sin(t)) * sa,
        d[1] * ca + (u[1] * Math.cos(t) + v[1] * Math.sin(t)) * sa,
        d[2] * ca + (u[2] * Math.cos(t) + v[2] * Math.sin(t)) * sa
      ];
      const n = Math.hypot(p[0], p[1], p[2]) || 1;
      const rad = 0.94 + ((i * 0.37) % 1) * 0.16;
      nodes.push({
        base: [(p[0] / n) * rad, (p[1] / n) * rad, (p[2] / n) * rad],
        name: item.name,
        weight: item.weight,
        cat: ci,
        tabId: cat.tabId,
        phase: (i * 1.3 + ci) % TAU,
        sx: 0, sy: 0, depth: 0
      });
    });
  });

  // Link each node to its two nearest same-category neighbours, plus one thin
  // bridge between adjacent category clusters so the whole thing reads as one system.
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    const cands = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j || nodes[j].cat !== nodes[i].cat) continue;
      const a = nodes[i].base, b = nodes[j].base;
      cands.push([(a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2, j]);
    }
    cands.sort((x, y) => x[0] - y[0]);
    for (let k = 0; k < Math.min(2, cands.length); k++) {
      const j = cands[k][1];
      if (i < j) links.push([i, j, 1]);
    }
  }
  for (let c = 0; c < cats.length; c++) {
    const a = nodes.findIndex((n) => n.cat === c);
    const b = nodes.findIndex((n) => n.cat === (c + 1) % cats.length);
    if (a >= 0 && b >= 0) links.push([a, b, 0]);
  }

  let w = 0, h = 0, project = null, R = 0;
  let yaw = 0.4, pitch = -0.18;
  let yawOff = 0, pitchOff = 0, tYaw = 0, tPitch = 0;
  let hover = -1;
  let time = 0;
  let active = -1;                 // -1 means no category emphasised
  const emph = new Float32Array(cats.length).fill(1);   // eased per category
  let focus = 0;                   // seconds left of the swing-to-face motion
  let focusYaw = 0, focusPitch = 0;

  /** Yaw and pitch that bring a direction round to face the camera. */
  function facing(d) {
    const r = Math.hypot(d[0], d[2]) || 1e-6;
    return [Math.atan2(-d[0], d[2]), Math.atan2(d[1], r)];
  }

  function resize() {
    const m = fitCanvas(canvas, ctx);
    if (!m) return false;
    w = m.w; h = m.h;
    R = Math.min(w, h) * (small ? 0.38 : 0.45);
    project = makeProjector(w / 2, h / 2, R, 3.2);
    return true;
  }

  const labelFont = small ? '600 10.5px' : '600 12px';
  const fontStack = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  function draw(dt) {
    if (!project) return;
    time += dt;
    if (!reduced) {
      if (focus > 0) {
        // Ease onto the selected cluster rather than spinning past it.
        focus -= dt;
        let d = focusYaw - yaw;
        d = Math.atan2(Math.sin(d), Math.cos(d));   // shortest way round
        yaw += d * 0.07;
        pitch += (focusPitch - pitch) * 0.07;
      } else {
        yaw += dt * 0.062;
        pitch += (-0.18 - pitch) * 0.02;
      }
      yawOff += (tYaw - yawOff) * 0.05;
      pitchOff += (tPitch - pitchOff) * 0.05;
    }
    // Ease each category toward its target emphasis.
    for (let c = 0; c < emph.length; c++) {
      const target = active < 0 ? 1 : (c === active ? 1 : 0.34);
      emph[c] += (target - emph[c]) * (reduced ? 1 : 0.12);
    }
    ctx.clearRect(0, 0, w, h);

    const Y = yaw + yawOff;
    const P = pitch + pitchOff;
    const sy = Math.sin(Y), cy = Math.cos(Y), sp = Math.sin(P), cp = Math.cos(P);

    // Positions, with a slow breathing drift so the cluster feels alive.
    for (const n of nodes) {
      const puff = reduced ? 1 : 1 + Math.sin(time * 0.55 + n.phase) * 0.022;
      const p = project(
        [n.base[0] * puff, n.base[1] * puff, n.base[2] * puff],
        sy, cy, sp, cp
      );
      n.sx = p[0]; n.sy = p[1]; n.depth = (p[2] + 1) / 2;
    }

    // Ambient core glow.
    const g = ctx.createRadialGradient(w / 2, h / 2, R * 0.2, w / 2, h / 2, R * 1.25);
    g.addColorStop(0, 'rgba(56,189,248,0.10)');
    g.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Links.
    for (const [i, j, strong] of links) {
      const a = nodes[i], b = nodes[j];
      const d = (a.depth + b.depth) / 2;
      const lit = hover === i || hover === j;
      const base = strong ? 0.20 : 0.09;
      const e = Math.min(emph[a.cat], emph[b.cat]);
      const alpha = (lit ? 0.62 : base * (0.25 + d)) * e;
      if (alpha < 0.012) continue;
      const t = CATEGORY_TINT[a.cat % CATEGORY_TINT.length];
      ctx.strokeStyle = `rgba(${t[0]},${t[1]},${t[2]},${alpha.toFixed(3)})`;
      ctx.lineWidth = lit ? 1.4 : 0.6 + d * 0.5;
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();
    }

    // Nodes back to front so nearer ones sit on top.
    const order = nodes.map((n, i) => i).sort((a, b) => nodes[a].depth - nodes[b].depth);

    for (const i of order) {
      const n = nodes[i];
      const t = CATEGORY_TINT[n.cat % CATEGORY_TINT.length];
      const lit = hover === i;
      const e = emph[n.cat];
      const wScale = 0.78 + n.weight * 0.22;        // evidence drives size
      const r = (small ? 2.0 : 2.6) * wScale * (0.55 + n.depth * 0.8) * (lit ? 1.5 : 1);

      if ((n.depth > 0.6 || lit) && e > 0.3) {
        ctx.fillStyle = `rgba(${t[0]},${t[1]},${t[2]},${((lit ? 0.30 : 0.10 * n.depth) * e).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, r * (lit ? 5 : 3.4), 0, TAU);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(${t[0]},${t[1]},${t[2]},${((0.30 + n.depth * 0.7) * e).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(n.sx, n.sy, r, 0, TAU);
      ctx.fill();

      // Labels only for nodes facing the viewer, so it never turns into soup.
      // When a category is selected its labels show more readily.
      const cut = active === n.cat ? (small ? 0.72 : 0.56) : (small ? 0.86 : 0.70);
      const showLabel = lit || (n.depth > cut && e > 0.5);
      if (showLabel) {
        const a = (lit ? 1 : Math.min(1, (n.depth - (cut - 0.06)) * 3.2)) * e;
        ctx.font = `${labelFont} ${fontStack}`;
        ctx.textBaseline = 'middle';
        const tw = ctx.measureText(n.name).width;

        // Flip the label to the other side of the node rather than let it run
        // off the canvas, and keep it inside the box vertically.
        const gap = r + 6;
        let lx = n.sx + gap;
        if (lx + tw > w - 8) lx = n.sx - gap - tw;
        lx = Math.max(6, Math.min(lx, w - tw - 6));
        const ly = Math.max(12, Math.min(n.sy, h - 12));

        if (lit) {
          ctx.fillStyle = 'rgba(6,8,12,0.86)';
          ctx.beginPath();
          ctx.roundRect(lx - 5, ly - 10, tw + 10, 20, 5);
          ctx.fill();
        }
        ctx.fillStyle = lit
          ? 'rgba(232,238,251,1)'
          : `rgba(174,187,208,${(a * 0.85).toFixed(3)})`;
        ctx.fillText(n.name, lx, ly);
      }
    }
  }

  if (!resize()) {
    requestAnimationFrame(() => { if (resize()) loop.start(); });
  }

  const loop = createLoop(canvas, draw, { reduced });

  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (resize()) draw(0); }, 150);
  };
  window.addEventListener('resize', onResize, { passive: true });

  function pick(px, py) {
    let best = -1, bestD = 26 * 26;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.depth < 0.4) continue;
      const d = (n.sx - px) ** 2 + (n.sy - py) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  let onMove = null, onLeave = null, onClick = null;
  if (finePointer()) {
    onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      hover = pick(px, py);
      canvas.style.cursor = hover >= 0 ? 'pointer' : '';
      tYaw = ((px / r.width) * 2 - 1) * 0.3;
      tPitch = ((py / r.height) * 2 - 1) * 0.2;
      if (reduced) draw(0);
    };
    onLeave = () => { hover = -1; tYaw = 0; tPitch = 0; canvas.style.cursor = ''; if (reduced) draw(0); };
    onClick = (e) => {
      const r = canvas.getBoundingClientRect();
      const i = pick(e.clientX - r.left, e.clientY - r.top);
      if (i >= 0) {
        const tab = document.getElementById(nodes[i].tabId);
        if (tab) { tab.click(); tab.focus(); }
      }
    };
    canvas.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerleave', onLeave, { passive: true });
    canvas.addEventListener('click', onClick);
  }

  return {
    setCategory(index) {
      const next = typeof index === 'number' ? index : -1;
      if (next !== active && next >= 0 && centers[next]) {
        const [fy, fp] = facing(centers[next]);
        focusYaw = fy;
        focusPitch = fp;
        focus = 2.4;
      }
      active = next;
      if (reduced) draw(0);
    },
    destroy() {
      loop.destroy();
      window.removeEventListener('resize', onResize);
      if (onMove) canvas.removeEventListener('pointermove', onMove);
      if (onLeave) canvas.removeEventListener('pointerleave', onLeave);
      if (onClick) canvas.removeEventListener('click', onClick);
    }
  };
}
