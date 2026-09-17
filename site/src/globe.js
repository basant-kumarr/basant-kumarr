/* Hero globe, layered.
   Real 3D: every point lives on or around a unit sphere, is rotated by yaw and
   pitch and projected through a perspective camera, with brightness and size
   driven by depth. Drawn on a 2D canvas, so there is no WebGL requirement and
   no framework.

   Density is the point, so the whole scene is batched: tiny points accumulate
   into one path per depth bucket and are filled in a single call, and lines do
   the same. Roughly 900 elements cost a few dozen draw calls per frame.

   Layers, back to front:
     1  distant starfield, barely moving
     2  faint wireframe shell
     3  outer dust at varying radii
     4  surface node field
     5  connection lines between hubs
     6  orbital arcs
     7  hub nodes
     8  atmospheric glow
   Each layer rotates at a slightly different rate, which is what reads as depth. */

import { TAU, fibonacciSphere, createLoop, finePointer } from './proj.js';

const BUCKETS = 9;

function buildWire(rings, meridians, seg) {
  const lines = [];
  for (let i = 1; i < rings; i++) {
    const lat = -Math.PI / 2 + (i / rings) * Math.PI;
    const y = Math.sin(lat), r = Math.cos(lat);
    const pts = [];
    for (let s = 0; s <= seg; s++) {
      const lon = (s / seg) * TAU;
      pts.push([Math.cos(lon) * r, y, Math.sin(lon) * r]);
    }
    lines.push(pts);
  }
  for (let m = 0; m < meridians; m++) {
    const lon = (m / meridians) * TAU;
    const cl = Math.cos(lon), sl = Math.sin(lon);
    const pts = [];
    const half = Math.round(seg / 2);
    for (let s = 0; s <= half; s++) {
      const lat = -Math.PI / 2 + (s / half) * Math.PI;
      const y = Math.sin(lat), r = Math.cos(lat);
      pts.push([cl * r, y, sl * r]);
    }
    lines.push(pts);
  }
  return lines;
}

/** Points along the great circle between two unit vectors. */
function greatArc(a, b, steps, lift) {
  const dot = Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2]));
  const om = Math.acos(dot);
  const so = Math.sin(om) || 1e-6;
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s1 = Math.sin((1 - t) * om) / so;
    const s2 = Math.sin(t * om) / so;
    let x = a[0]*s1 + b[0]*s2, y = a[1]*s1 + b[1]*s2, z = a[2]*s1 + b[2]*s2;
    const n = Math.hypot(x, y, z) || 1;
    // Bow the arc outward so it reads as a link over the surface.
    const k = (1 + Math.sin(t * Math.PI) * lift) / n;
    out.push([x * k, y * k, z * k]);
  }
  return out;
}

export function initGlobe(canvas, opts = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;

  const reduced = opts.reduced === true;
  const small = opts.small === true;

  const cfg = small
    ? { rings: 7,  mer: 12, seg: 40, surface: 150, dust: 105, stars: 80,  hubs: 14, links: 14, arcs: 2, inbound: 7 }
    : { rings: 12, mer: 20, seg: 64, surface: 470, dust: 300, stars: 230, hubs: 36, links: 48, arcs: 3, inbound: 22 };

  const wire = buildWire(cfg.rings, cfg.mer, cfg.seg);

  // Layer 4: surface field, sitting just above the shell.
  const surface = fibonacciSphere(cfg.surface).map((p, i) => {
    const k = 1.005 + ((i * 0.37) % 1) * 0.02;
    return [p[0] * k, p[1] * k, p[2] * k];
  });

  // Layer 7: hubs, the few points bright enough to notice.
  const hubs = fibonacciSphere(cfg.hubs).map((p) => [p[0] * 1.02, p[1] * 1.02, p[2] * 1.02]);

  // Layer 5: links between nearby hubs, bowed into arcs.
  const links = [];
  for (let i = 0; i < hubs.length && links.length < cfg.links; i++) {
    const cands = [];
    for (let j = 0; j < hubs.length; j++) {
      if (i === j) continue;
      const d = (hubs[i][0]-hubs[j][0])**2 + (hubs[i][1]-hubs[j][1])**2 + (hubs[i][2]-hubs[j][2])**2;
      cands.push([d, j]);
    }
    cands.sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < 2 && k < cands.length; k++) {
      const j = cands[k][1];
      if (i < j) links.push({ a: i, b: j, pts: greatArc(hubs[i], hubs[j], 14, 0.10) });
    }
  }

  // Layer 3: dust shell around the globe.
  const dust = fibonacciSphere(cfg.dust).map((p, i) => {
    const k = 1.14 + ((i * 0.613) % 1) * 0.5;
    return [p[0] * k, p[1] * k, p[2] * k, 0.3 + ((i * 0.29) % 1) * 0.7];
  });

  // Layer 1: far field, effectively a backdrop.
  const stars = fibonacciSphere(cfg.stars).map((p, i) => {
    const k = 2.0 + ((i * 0.811) % 1) * 1.1;
    return [p[0] * k, p[1] * k, p[2] * k, 0.25 + ((i * 0.53) % 1) * 0.55];
  });

  // Layer 6: orbital arcs on their own tilts.
  const orbits = [
    { tilt: 0.58, spin: 0.2, r: 1.20, alpha: 0.30, rate: 1.25 },
    { tilt: -0.80, spin: 1.9, r: 1.36, alpha: 0.18, rate: 0.75 },
    { tilt: 1.15, spin: 3.4, r: 1.52, alpha: 0.12, rate: 1.7 }
  ].slice(0, cfg.arcs).map((o) => {
    const pts = [];
    const ct = Math.cos(o.tilt), st = Math.sin(o.tilt);
    const cs = Math.cos(o.spin), ss = Math.sin(o.spin);
    for (let i = 0; i <= 110; i++) {
      const a = (i / 110) * TAU;
      const x = Math.cos(a) * o.r, z = Math.sin(a) * o.r;
      const y1 = -z * st, z1 = z * ct;
      pts.push([x * cs + z1 * ss, y1, -x * ss + z1 * cs]);
    }
    return { pts, alpha: o.alpha, rate: o.rate };
  });

  let w = 0, h = 0, cx = 0, cy = 0, R = 0;
  let t = 0;
  const baseTilt = -0.30;
  let yawOff = 0, pitchOff = 0, tYaw = 0, tPitch = 0;
  let hover = -1, hoverX = 0, hoverY = 0;
  const hubScreen = new Float32Array(cfg.hubs * 3);

  // Travelling points on the hub links: the network visibly carrying something.
  const pulses = links.map((_, i) => ({
    k: (i * 0.137) % 1,
    sp: 0.055 + ((i * 0.31) % 1) * 0.075,
    bright: 0
  }));
  let nextFlare = 1.5;

  /* Inbound traces. These enter from the text side of the hero and run into the
     globe, so the headline reads as the thing feeding the system. Screen space,
     which keeps them cheap and keeps them aimed at the sphere wherever it sits. */
  const inbound = [];
  for (let i = 0; i < cfg.inbound; i++) {
    inbound.push({
      k: i / cfg.inbound,
      lane: (i * 0.618) % 1,
      sp: 0.07 + ((i * 0.41) % 1) * 0.09,
      len: 0.05 + ((i * 0.23) % 1) * 0.07
    });
  }

  let camX = 0, camY = 0;      // slow autonomous drift
  let scrollK = 0;             // hero scroll progress, 0 at top

  /* The atmosphere and inner light are static for a given size, and filling two
     large radial gradients every frame is the single most expensive thing in the
     scene. Render them once into an offscreen bitmap and blit it instead. */
  let atmos = null;

  function buildAtmosphere() {
    const size = Math.ceil(R * 3.6);
    if (!(size > 0)) { atmos = null; return; }
    const off = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
    off.width = Math.ceil(size * dpr);
    off.height = Math.ceil(size * dpr);
    const o = off.getContext('2d');
    if (!o) { atmos = null; return; }
    o.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = size / 2;

    const glow = o.createRadialGradient(m, m, R * 0.35, m, m, R * 1.75);
    glow.addColorStop(0, 'rgba(56,189,248,0.17)');
    glow.addColorStop(0.42, 'rgba(56,189,248,0.075)');
    glow.addColorStop(0.75, 'rgba(99,102,241,0.035)');
    glow.addColorStop(1, 'rgba(56,189,248,0)');
    o.fillStyle = glow;
    o.beginPath(); o.arc(m, m, R * 1.75, 0, TAU); o.fill();

    const core = o.createRadialGradient(
      m - R * 0.18, m - R * 0.16, R * 0.05, m, m, R * 1.02);
    core.addColorStop(0, 'rgba(125,211,252,0.13)');
    core.addColorStop(0.45, 'rgba(56,189,248,0.055)');
    core.addColorStop(1, 'rgba(8,14,26,0)');
    o.fillStyle = core;
    o.beginPath(); o.arc(m, m, R * 1.02, 0, TAU); o.fill();

    atmos = { canvas: off, size };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2; cy = h / 2;
    R = Math.min(w, h) * 0.40;
    buildAtmosphere();
    return true;
  }

  const CAM = 3.4;

  function draw(dt) {
    if (!w || !h) return;
    if (!reduced) {
      t += dt;
      yawOff += (tYaw - yawOff) * 0.045;
      pitchOff += (tPitch - pitchOff) * 0.045;
    }
    ctx.clearRect(0, 0, w, h);

    // Layers drift at different rates. That difference is the depth cue.
    const baseYaw = 0.6 + t * 0.070;
    if (!reduced) {
      // Autonomous camera drift, two slow sines so it never repeats obviously.
      camX = Math.sin(t * 0.17) * 0.035 + Math.sin(t * 0.071) * 0.022;
      camY = Math.cos(t * 0.13) * 0.028;
    }
    const bob = reduced ? 0 : Math.sin(t * 0.32) * R * 0.022 + scrollK * R * 0.10;
    const pitch = baseTilt + pitchOff + camY + scrollK * 0.10;
    const sp = Math.sin(pitch), cp = Math.cos(pitch);

    const mk = (yaw) => {
      const sy = Math.sin(yaw), cyw = Math.cos(yaw);
      return (p) => {
        const x1 = p[0] * cyw + p[2] * sy;
        const z1 = -p[0] * sy + p[2] * cyw;
        const y2 = p[1] * cp - z1 * sp;
        const z2 = p[1] * sp + z1 * cp;
        const k = CAM / (CAM - z2);
        return [cx + x1 * R * k, cy + bob + y2 * R * k, z2];
      };
    };

    const pShell = mk(baseYaw + yawOff + camX);
    const pDust  = mk(baseYaw * 0.82 + yawOff * 1.35 + camX * 1.5);
    const pStars = mk(baseYaw * 0.35 + yawOff * 0.5 + camX * 0.4);

    /* ---- 8: atmosphere ---- */
    if (atmos) {
      const half = atmos.size / 2;
      ctx.drawImage(atmos.canvas, cx - half, cy + bob - half, atmos.size, atmos.size);
    }

    /* ---- 1: far field ---- */
    ctx.fillStyle = 'rgba(148,178,216,0.30)';
    ctx.beginPath();
    for (const s of stars) {
      const q = pStars(s);
      const d = (q[2] + 3) / 6;
      const r = 0.45 + d * 0.5;
      ctx.rect(q[0] - r, q[1] - r, r * 2, r * 2);
    }
    ctx.fill();

    /* ---- 2: wireframe shell, bucketed by depth ---- */
    const buckets = Array.from({ length: BUCKETS }, () => []);
    for (const line of wire) {
      let prev = pShell(line[0]);
      for (let i = 1; i < line.length; i++) {
        const cur = pShell(line[i]);
        const zm = (prev[2] + cur[2]) / 2;
        if (zm > -0.86) {                       // deepest band is near invisible
          let b = ((zm + 1) / 2 * BUCKETS) | 0;
          if (b < 0) b = 0; else if (b >= BUCKETS) b = BUCKETS - 1;
          const arr = buckets[b];
          arr.push(prev[0], prev[1], cur[0], cur[1]);
        }
        prev = cur;
      }
    }
    for (let b = 0; b < BUCKETS; b++) {
      const seg = buckets[b];
      if (!seg.length) continue;
      const f = b / (BUCKETS - 1);
      ctx.strokeStyle = `rgba(56,189,248,${(0.040 + f * 0.215).toFixed(3)})`;
      ctx.lineWidth = 0.5 + f * 0.45;
      ctx.beginPath();
      for (let i = 0; i < seg.length; i += 4) {
        ctx.moveTo(seg[i], seg[i + 1]);
        ctx.lineTo(seg[i + 2], seg[i + 3]);
      }
      ctx.stroke();
    }

    /* ---- 3: dust shell, batched into four alpha bands ---- */
    const bands = [[], [], [], []];
    for (const d of dust) {
      const q = pDust(d);
      const depth = (q[2] + 1.6) / 3.2;
      const bi = Math.min(3, Math.max(0, (depth * 4) | 0));
      bands[bi].push(q[0], q[1], 0.45 + depth * 1.05, d[3]);
    }
    for (let i = 0; i < 4; i++) {
      const arr = bands[i];
      if (!arr.length) continue;
      ctx.fillStyle = `rgba(56,189,248,${(0.06 + i * 0.085).toFixed(3)})`;
      ctx.beginPath();
      for (let k = 0; k < arr.length; k += 4) {
        const r = arr[k + 2] * arr[k + 3];
        ctx.rect(arr[k] - r, arr[k + 1] - r, r * 2, r * 2);
      }
      ctx.fill();
    }

    /* ---- 4: surface field ---- */
    const sBands = [[], [], [], [], []];
    for (const p of surface) {
      const q = pShell(p);
      if (q[2] < -0.55) continue;
      const depth = (q[2] + 1) / 2;
      const bi = Math.min(4, (depth * 5) | 0);
      sBands[bi].push(q[0], q[1], 0.4 + depth * 1.25);
    }
    for (let i = 0; i < 5; i++) {
      const arr = sBands[i];
      if (!arr.length) continue;
      ctx.fillStyle = `rgba(186,230,253,${(0.07 + i * 0.115).toFixed(3)})`;
      ctx.beginPath();
      for (let k = 0; k < arr.length; k += 3) {
        const r = arr[k + 2];
        ctx.rect(arr[k] - r, arr[k + 1] - r, r * 2, r * 2);
      }
      ctx.fill();
    }

    /* ---- 7a: hub positions (needed before links so hover can highlight) ---- */
    for (let i = 0; i < hubs.length; i++) {
      const q = pShell(hubs[i]);
      hubScreen[i * 3] = q[0];
      hubScreen[i * 3 + 1] = q[1];
      hubScreen[i * 3 + 2] = q[2];
    }

    /* ---- 5: connection arcs between hubs ---- */
    for (const L of links) {
      const lit = hover === L.a || hover === L.b;
      let prev = pShell(L.pts[0]);
      for (let i = 1; i < L.pts.length; i++) {
        const cur = pShell(L.pts[i]);
        const zm = (prev[2] + cur[2]) / 2;
        if (zm > -0.2) {
          const depth = (zm + 1) / 2;
          ctx.strokeStyle = lit
            ? `rgba(186,230,253,${(0.35 + depth * 0.5).toFixed(3)})`
            : `rgba(125,211,252,${(0.07 + depth * 0.36).toFixed(3)})`;
          ctx.lineWidth = lit ? 1.5 : 0.55 + depth * 0.5;
          ctx.beginPath();
          ctx.moveTo(prev[0], prev[1]);
          ctx.lineTo(cur[0], cur[1]);
          ctx.stroke();
        }
        prev = cur;
      }
    }

    /* ---- 5b: points travelling the links, plus an occasional flare ---- */
    if (!reduced) {
      nextFlare -= dt;
      if (nextFlare <= 0) {
        pulses[(Math.random() * pulses.length) | 0].bright = 1;
        nextFlare = 1.1 + Math.random() * 2.2;
      }
    }
    for (let i = 0; i < links.length; i++) {
      const L = links[i], P = pulses[i];
      if (!reduced) {
        P.k += dt * P.sp;
        if (P.k > 1) P.k -= 1;
        if (P.bright > 0) P.bright = Math.max(0, P.bright - dt * 0.8);
      }
      const idx = Math.min(L.pts.length - 1, (P.k * (L.pts.length - 1)) | 0);
      const q = pShell(L.pts[idx]);
      if (q[2] < -0.15) continue;
      const depth = (q[2] + 1) / 2;
      const r = (0.9 + depth * 1.3) * (1 + P.bright * 1.6);
      if (P.bright > 0.02) {
        ctx.fillStyle = `rgba(186,230,253,${(P.bright * 0.22).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(q[0], q[1], r * 5, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = `rgba(224,242,254,${(0.25 + depth * 0.5 + P.bright * 0.25).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, TAU); ctx.fill();
    }

    /* ---- 6: orbital arcs ---- */
    for (const orb of orbits) {
      const po = mk(baseYaw * orb.rate + yawOff * 1.1);
      let prev = po(orb.pts[0]);
      for (let i = 1; i < orb.pts.length; i++) {
        const cur = po(orb.pts[i]);
        const depth = ((prev[2] + cur[2]) / 2 + 1.6) / 3.2;
        ctx.strokeStyle = `rgba(125,211,252,${(orb.alpha * (0.18 + depth * 1.0)).toFixed(3)})`;
        ctx.lineWidth = 0.6 + depth * 0.85;
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(cur[0], cur[1]);
        ctx.stroke();
        prev = cur;
      }
    }

    /* ---- 7b: hubs ---- */
    for (let i = 0; i < hubs.length; i++) {
      const x = hubScreen[i * 3], y = hubScreen[i * 3 + 1], z = hubScreen[i * 3 + 2];
      if (z < -0.35) continue;
      const depth = (z + 1) / 2;
      const lit = hover === i;
      const r = (1.1 + depth * 2.0) * (lit ? 1.7 : 1);
      const twinkle = reduced ? 1 : 0.8 + Math.sin(t * 1.4 + i * 1.7) * 0.2;

      ctx.fillStyle = `rgba(56,189,248,${((lit ? 0.34 : 0.12 * depth) * twinkle).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, r * (lit ? 5.5 : 3.6), 0, TAU);
      ctx.fill();

      ctx.fillStyle = `rgba(224,242,254,${(0.28 + depth * 0.72).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }

    /* ---- inbound traces: text side into the globe ---- */
    for (const f of inbound) {
      if (!reduced) {
        f.k += dt * f.sp;
        if (f.k > 1.08) f.k -= 1.16;
      }
      if (f.k < 0) continue;
      const startX = -w * 0.06;
      const startY = h * (0.16 + f.lane * 0.68);
      const ease = f.k * f.k * (3 - 2 * f.k);          // smoothstep
      const hx = startX + (cx - startX) * ease;
      const hy = startY + (cy + bob - startY) * ease;
      const e2 = Math.max(0, ease - f.len);
      const tx = startX + (cx - startX) * e2;
      const ty = startY + (cy + bob - startY) * e2;
      // Fade in from the text, fade out as it reaches the sphere.
      const a = Math.min(1, f.k * 3) * Math.max(0, 1 - Math.max(0, f.k - 0.72) / 0.3);
      if (a <= 0.01) continue;
      ctx.strokeStyle = `rgba(125,211,252,${(a * 0.32).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = `rgba(186,230,253,${(a * 0.75).toFixed(3)})`;
      ctx.beginPath(); ctx.rect(hx - 1.4, hy - 1.4, 2.8, 2.8); ctx.fill();
    }

    if (hover >= 0) {
      const x = hubScreen[hover * 3], y = hubScreen[hover * 3 + 1];
      ctx.strokeStyle = 'rgba(186,230,253,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 13 + Math.sin(t * 3) * 1.6, 0, TAU);
      ctx.stroke();
      void hoverX; void hoverY;
    }
  }

  if (!resize()) requestAnimationFrame(() => { if (resize()) draw(0); });
  const loop = createLoop(canvas, draw, { reduced });

  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (resize()) draw(0); }, 150);
  };
  window.addEventListener('resize', onResize, { passive: true });

  // Scroll nudges the camera, so leaving the hero feels like moving past the object.
  let onScroll = null;
  if (!reduced) {
    onScroll = () => {
      const r = canvas.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      scrollK = Math.max(-1, Math.min(1, (vh * 0.5 - (r.top + r.height / 2)) / vh));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  let onMove = null;
  if (finePointer()) {
    onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      tYaw = nx * 0.26;
      tPitch = ny * 0.18;

      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      let best = -1, bestD = 22 * 22;
      for (let i = 0; i < hubs.length; i++) {
        if (hubScreen[i * 3 + 2] < 0) continue;
        const dx = hubScreen[i * 3] - px, dy = hubScreen[i * 3 + 1] - py;
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = i; }
      }
      hover = best;
      hoverX = px; hoverY = py;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
  }

  return {
    destroy() {
      loop.destroy();
      window.removeEventListener('resize', onResize);
      if (onMove) window.removeEventListener('pointermove', onMove);
      if (onScroll) window.removeEventListener('scroll', onScroll);
    }
  };
}
