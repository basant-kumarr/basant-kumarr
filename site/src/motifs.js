/* Project motifs.
   One small animated drawing per project, chosen to stand for what the project
   actually is. They are metaphors, not data: no figure here is presented as a
   measurement, and every real number on the page is HTML text elsewhere. */

import { TAU, fitCanvas, createLoop } from './proj.js';

const ACC = '56,189,248';
const ACC2 = '125,211,252';
const IND = '129,140,248';

/** Small deterministic PRNG so each motif lays out the same way every load. */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* -------------------------------------------------- map: regional data network */
function makeMap(w, h) {
  const r = rng(7);
  const pts = [];
  for (let i = 0; i < 26; i++) {
    // Loose vertical island silhouette rather than a real map.
    const t = i / 26;
    const cx = 0.5 + Math.sin(t * 5.2) * 0.22 + (r() - 0.5) * 0.24;
    const cy = 0.12 + t * 0.76 + (r() - 0.5) * 0.12;
    pts.push({ x: cx, y: cy, hub: i % 7 === 0, ph: r() * TAU });
  }
  return { pts, w, h };
}
function drawMap(ctx, st, w, h, t) {
  const { pts } = st;
  const hubs = pts.filter((p) => p.hub);
  ctx.lineWidth = 0.7;
  for (const p of pts) {
    let best = hubs[0], bd = Infinity;
    for (const hb of hubs) {
      const d = (p.x - hb.x) ** 2 + (p.y - hb.y) ** 2;
      if (d < bd && d > 0) { bd = d; best = hb; }
    }
    ctx.strokeStyle = `rgba(${ACC},0.16)`;
    ctx.beginPath();
    ctx.moveTo(p.x * w, p.y * h);
    ctx.lineTo(best.x * w, best.y * h);
    ctx.stroke();
  }
  // Slow scan sweep, the projection running forward.
  const sweep = ((t * 0.16) % 1.35) - 0.18;
  for (const p of pts) {
    const near = 1 - Math.min(1, Math.abs(p.y - sweep) * 7);
    const a = 0.3 + near * 0.7;
    ctx.fillStyle = p.hub ? `rgba(${ACC2},${a})` : `rgba(${ACC},${a * 0.75})`;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, p.hub ? 2.6 : 1.6, 0, TAU);
    ctx.fill();
    if (near > 0.55) {
      ctx.strokeStyle = `rgba(${ACC2},${(near - 0.55) * 0.7})`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 4 + (1 - near) * 9, 0, TAU);
      ctx.stroke();
    }
  }
}

/* -------------------------------------------------- product: system with a core */
function makeProduct() {
  const labels = 6;
  const sats = [];
  for (let i = 0; i < labels; i++) {
    sats.push({ a: (i / labels) * TAU, r: 0.30 + (i % 3) * 0.07, sp: 0.16 + (i % 4) * 0.035 });
  }
  return { sats };
}
function drawProduct(ctx, st, w, h, t) {
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h);
  // Deterministic core.
  const pulse = 0.5 + Math.sin(t * 1.1) * 0.5;
  ctx.fillStyle = `rgba(${ACC},${0.10 + pulse * 0.10})`;
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.17, 0, TAU); ctx.fill();
  ctx.fillStyle = `rgba(${ACC2},0.92)`;
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.048, 0, TAU); ctx.fill();

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${ACC},${0.20 - i * 0.05})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(cx, cy, R * (0.20 + i * 0.11), 0, TAU); ctx.stroke();
  }

  for (const s of st.sats) {
    const a = s.a + t * s.sp;
    const x = cx + Math.cos(a) * R * s.r * 1.55;
    const y = cy + Math.sin(a) * R * s.r;
    ctx.strokeStyle = `rgba(${ACC},0.24)`;
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();

    // A recommendation travelling inward along the pathway.
    const k = (t * 0.42 + s.a) % 1;
    ctx.fillStyle = `rgba(${ACC2},${(1 - k) * 0.8})`;
    ctx.beginPath();
    ctx.arc(cx + (x - cx) * k, cy + (y - cy) * k, 1.5, 0, TAU);
    ctx.fill();

    ctx.fillStyle = `rgba(${ACC2},0.85)`;
    ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill();
  }
}

/* -------------------------------------------------- flow: lanes and stages */
function drawFlow(ctx, _st, w, h, t) {
  const lanes = 4;
  const padX = w * 0.06;
  const usable = w - padX * 2;
  for (let l = 0; l < lanes; l++) {
    const y = ((l + 0.5) / lanes) * h;
    ctx.strokeStyle = `rgba(${ACC},0.10)`;
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(padX * 0.4, y); ctx.lineTo(w - padX * 0.4, y); ctx.stroke();
  }
  // Stage boxes zig-zagging across lanes, the As-Is path.
  const stages = [0, 1, 1, 2, 3];
  const n = stages.length;
  const pos = stages.map((l, i) => ({
    x: padX + (i / (n - 1)) * usable,
    y: ((l + 0.5) / lanes) * h
  }));
  ctx.lineWidth = 0.9;
  for (let i = 0; i < pos.length - 1; i++) {
    ctx.strokeStyle = `rgba(${ACC},0.30)`;
    ctx.beginPath();
    ctx.moveTo(pos[i].x, pos[i].y);
    ctx.lineTo(pos[i + 1].x, pos[i].y);
    ctx.lineTo(pos[i + 1].x, pos[i + 1].y);
    ctx.stroke();
  }
  // Token moving through the process.
  const prog = (t * 0.22) % 1;
  const seg = Math.min(n - 2, Math.floor(prog * (n - 1)));
  const local = prog * (n - 1) - seg;
  const a = pos[seg], b = pos[seg + 1];
  const tx = a.x + (b.x - a.x) * Math.min(1, local * 2);
  const ty = local > 0.5 ? a.y + (b.y - a.y) * ((local - 0.5) * 2) : a.y;
  ctx.fillStyle = `rgba(${ACC2},0.95)`;
  ctx.beginPath(); ctx.arc(tx, ty, 3, 0, TAU); ctx.fill();
  ctx.fillStyle = `rgba(${ACC2},0.22)`;
  ctx.beginPath(); ctx.arc(tx, ty, 7, 0, TAU); ctx.fill();

  for (const p of pos) {
    ctx.fillStyle = 'rgba(13,18,27,1)';
    ctx.strokeStyle = `rgba(${ACC},0.55)`;
    ctx.lineWidth = 1;
    const bw = Math.max(14, w * 0.062), bh = 9;
    ctx.beginPath();
    ctx.roundRect(p.x - bw / 2, p.y - bh / 2, bw, bh, 2.5);
    ctx.fill(); ctx.stroke();
  }
}

/* -------------------------------------------------- network: transactions, anomalies */
function makeNetwork() {
  const r = rng(21);
  const nodes = [];
  for (let i = 0; i < 30; i++) {
    nodes.push({ x: 0.06 + r() * 0.88, y: 0.12 + r() * 0.76, flag: i % 11 === 3, ph: r() * TAU });
  }
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < 0.20) edges.push([i, j]);
    }
  }
  return { nodes, edges };
}
function drawNetwork(ctx, st, w, h, t) {
  const { nodes, edges } = st;
  ctx.lineWidth = 0.6;
  for (const [i, j] of edges) {
    ctx.strokeStyle = `rgba(${ACC},0.13)`;
    ctx.beginPath();
    ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
    ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
    ctx.stroke();
  }
  for (const n of nodes) {
    const x = n.x * w, y = n.y * h;
    if (n.flag) {
      const p = (Math.sin(t * 1.6 + n.ph) + 1) / 2;
      ctx.strokeStyle = `rgba(${ACC2},${0.20 + p * 0.55})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(x, y, 4 + p * 6, 0, TAU); ctx.stroke();
      ctx.fillStyle = `rgba(${ACC2},0.95)`;
      ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill();
    } else {
      ctx.fillStyle = `rgba(${ACC},0.42)`;
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, TAU); ctx.fill();
    }
  }
}

/* -------------------------------------------------- forecast: history then projection */
function makeForecast() {
  const r = rng(55);
  const hist = [];
  let v = 0.5;
  for (let i = 0; i < 26; i++) {
    v += (r() - 0.5) * 0.18;
    v = Math.max(0.16, Math.min(0.84, v));
    hist.push(v);
  }
  return { hist };
}
function drawForecast(ctx, st, w, h, t) {
  const { hist } = st;
  const split = 0.62;
  const n = hist.length;
  const X = (i) => (i / (n - 1)) * w * split;
  const Y = (v) => h - v * h * 0.8 - h * 0.1;

  // Forecast cone.
  const last = hist[n - 1];
  ctx.fillStyle = `rgba(${IND},0.10)`;
  ctx.beginPath();
  ctx.moveTo(w * split, Y(last));
  ctx.lineTo(w, Y(last + 0.20));
  ctx.lineTo(w, Y(last - 0.20));
  ctx.closePath();
  ctx.fill();

  // History, drawn progressively.
  const prog = Math.min(1, ((t * 0.30) % 2.6) / 1.5);
  ctx.strokeStyle = `rgba(${ACC},0.85)`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const upto = Math.max(1, Math.floor(prog * n));
  for (let i = 0; i < upto; i++) {
    const x = X(i), y = Y(hist[i]);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  // Projection.
  if (prog >= 1) {
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = `rgba(${IND},0.75)`;
    ctx.beginPath();
    ctx.moveTo(w * split, Y(last));
    ctx.lineTo(w, Y(last + 0.05));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(${ACC2},0.9)`;
    ctx.beginPath(); ctx.arc(w * split, Y(last), 2.8, 0, TAU); ctx.fill();
  }

  ctx.strokeStyle = `rgba(${ACC},0.14)`;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(w * split, h * 0.06);
  ctx.lineTo(w * split, h * 0.94);
  ctx.stroke();
}

/* -------------------------------------------------- telemetry: equipment signals */
function makeTelemetry() {
  return { units: [0.2, 0.45, 0.7], seed: rng(91) };
}
function drawTelemetry(ctx, st, w, h, t) {
  // Equipment row.
  for (let i = 0; i < st.units.length; i++) {
    const x = st.units[i] * w;
    const y = h * 0.24;
    const pulse = (Math.sin(t * 1.3 + i * 1.9) + 1) / 2;
    ctx.strokeStyle = `rgba(${ACC},0.45)`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x - 9, y - 7, 18, 14, 3); ctx.stroke();
    ctx.fillStyle = `rgba(${ACC2},${0.35 + pulse * 0.6})`;
    ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = `rgba(${ACC},0.18)`;
    ctx.beginPath(); ctx.moveTo(x, y + 7); ctx.lineTo(x, h * 0.58); ctx.stroke();
  }
  // Scrolling telemetry trace.
  const baseY = h * 0.76;
  ctx.strokeStyle = `rgba(${ACC},0.20)`;
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(w, baseY); ctx.stroke();

  ctx.strokeStyle = `rgba(${ACC2},0.8)`;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let px = 0; px <= w; px += 3) {
    const u = px / w;
    const s =
      Math.sin(u * 13 + t * 1.5) * 0.35 +
      Math.sin(u * 27 - t * 2.1) * 0.18 +
      Math.sin(u * 5 + t * 0.7) * 0.28;
    const y = baseY - s * h * 0.15;
    px ? ctx.lineTo(px, y) : ctx.moveTo(px, y);
  }
  ctx.stroke();
}

/* -------------------------------------------------- dispatch */

const BUILDERS = {
  map: makeMap,
  product: makeProduct,
  flow: () => ({}),
  network: makeNetwork,
  forecast: makeForecast,
  telemetry: makeTelemetry
};
const DRAWERS = {
  map: drawMap,
  product: drawProduct,
  flow: drawFlow,
  network: drawNetwork,
  forecast: drawForecast,
  telemetry: drawTelemetry
};

export function initMotif(canvas, type, { reduced = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx || !DRAWERS[type]) return null;

  let w = 0, h = 0, st = null, t = reduced ? 3.2 : 0;

  function resize() {
    const m = fitCanvas(canvas, ctx, 2);
    if (!m) return false;
    w = m.w; h = m.h;
    st = BUILDERS[type](w, h);
    return true;
  }

  function draw(dt) {
    if (!w || !st) return;
    if (!reduced) t += dt;
    ctx.clearRect(0, 0, w, h);
    DRAWERS[type](ctx, st, w, h, t);
  }

  if (!resize()) {
    requestAnimationFrame(() => { if (resize()) draw(0); });
  }
  const loop = createLoop(canvas, draw, { reduced });

  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (resize()) draw(0); }, 200);
  };
  window.addEventListener('resize', onResize, { passive: true });

  return { destroy() { loop.destroy(); window.removeEventListener('resize', onResize); } };
}
