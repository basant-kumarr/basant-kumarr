/* Hero globe.
   Real 3D: points live on a unit sphere, get rotated by yaw/pitch matrices and
   projected through a perspective camera. Rendered on a 2D canvas rather than
   WebGL, which keeps it dependency free, works where WebGL is blocked or
   unavailable, and costs a few kB instead of a few hundred.

   Depth comes from z: nearer geometry is brighter and larger. Segments are
   bucketed by depth and stroked as a handful of batched paths, so the whole
   frame is a few dozen draw calls rather than a few thousand. */

const TAU = Math.PI * 2;

// Depth buckets. More buckets means smoother depth at the cost of draw calls.
const BUCKETS = 7;

function fibonacciSphere(n) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return pts;
}

function buildWireframe(rings, meridians, seg) {
  const lines = [];
  // Latitude rings.
  for (let i = 1; i < rings; i++) {
    const lat = -Math.PI / 2 + (i / rings) * Math.PI;
    const y = Math.sin(lat);
    const r = Math.cos(lat);
    const pts = [];
    for (let s = 0; s <= seg; s++) {
      const lon = (s / seg) * TAU;
      pts.push([Math.cos(lon) * r, y, Math.sin(lon) * r]);
    }
    lines.push(pts);
  }
  // Longitude meridians.
  for (let m = 0; m < meridians; m++) {
    const lon = (m / meridians) * TAU;
    const cl = Math.cos(lon);
    const sl = Math.sin(lon);
    const pts = [];
    const half = Math.round(seg / 2);
    for (let s = 0; s <= half; s++) {
      const lat = -Math.PI / 2 + (s / half) * Math.PI;
      const y = Math.sin(lat);
      const r = Math.cos(lat);
      pts.push([cl * r, y, sl * r]);
    }
    lines.push(pts);
  }
  return lines;
}

export function initGlobe(canvas, opts = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;

  const reduced = opts.reduced === true;
  const small = opts.small === true;

  const cfg = small
    ? { rings: 7,  meridians: 12, seg: 40, nodes: 26, links: 16, dust: 22 }
    : { rings: 10, meridians: 18, seg: 64, nodes: 54, links: 34, dust: 46 };

  const wire = buildWireframe(cfg.rings, cfg.meridians, cfg.seg);
  const nodes = fibonacciSphere(cfg.nodes);

  // Link nearby nodes so the mesh reads as a network rather than random chords.
  const links = [];
  for (let i = 0; i < nodes.length && links.length < cfg.links; i++) {
    let best = -1;
    let bestD = Infinity;
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i][0] - nodes[j][0];
      const dy = nodes[i][1] - nodes[j][1];
      const dz = nodes[i][2] - nodes[j][2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestD) { bestD = d; best = j; }
    }
    if (best >= 0) links.push([i, best]);
  }

  // Orbit rings, tilted off the globe's own axis, drawn as great circles on a
  // slightly larger radius. These are what read as sweeping arcs across the sphere.
  const orbits = [
    { tilt: 0.55, spin: 0.25, r: 1.16, alpha: 0.30 },
    { tilt: -0.78, spin: 1.9, r: 1.30, alpha: 0.19 }
  ].map((o) => {
    const pts = [];
    const ct = Math.cos(o.tilt), st = Math.sin(o.tilt);
    const cs = Math.cos(o.spin), ss = Math.sin(o.spin);
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * TAU;
      let x = Math.cos(a) * o.r, y = 0, z = Math.sin(a) * o.r;
      // tilt about X
      let y1 = y * ct - z * st, z1 = y * st + z * ct;
      // spin about Y
      const x2 = x * cs + z1 * ss, z2 = -x * ss + z1 * cs;
      pts.push([x2, y1, z2]);
    }
    return { pts, alpha: o.alpha };
  });

  // Free floating dust around the sphere, for parallax depth.
  const dust = fibonacciSphere(cfg.dust).map((p) => {
    const k = 1.18 + Math.random() * 0.42;
    return [p[0] * k, p[1] * k, p[2] * k, 0.25 + Math.random() * 0.75];
  });

  let w = 0, h = 0, cx = 0, cy = 0, R = 0, dpr = 1;
  let yaw = 0.6;
  const baseTilt = -0.32;
  let pitch = baseTilt;
  let targetYawOff = 0, targetPitchOff = 0, yawOff = 0, pitchOff = 0;
  let raf = 0, running = false, last = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2;
    cy = h / 2;
    R = Math.min(w, h) * 0.42;
    return true;
  }

  const CAM = 3.0;

  function project(p, sy, cyw, sp, cp) {
    // Yaw about Y, then pitch about X.
    const x1 = p[0] * cyw + p[2] * sy;
    const z1 = -p[0] * sy + p[2] * cyw;
    const y2 = p[1] * cp - z1 * sp;
    const z2 = p[1] * sp + z1 * cp;
    const k = CAM / (CAM - z2);
    return [cx + x1 * R * k, cy + y2 * R * k, z2, k];
  }

  function draw() {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    const sy = Math.sin(yaw), cyw = Math.cos(yaw);
    const sp = Math.sin(pitch), cp = Math.cos(pitch);

    // Atmosphere.
    const glow = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R * 1.5);
    glow.addColorStop(0, 'rgba(56,189,248,0.18)');
    glow.addColorStop(0.55, 'rgba(56,189,248,0.07)');
    glow.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.5, 0, TAU);
    ctx.fill();

    // Wireframe, batched into depth buckets.
    const buckets = Array.from({ length: BUCKETS }, () => []);
    for (const line of wire) {
      let prev = project(line[0], sy, cyw, sp, cp);
      for (let i = 1; i < line.length; i++) {
        const cur = project(line[i], sy, cyw, sp, cp);
        const zm = (prev[2] + cur[2]) / 2;
        let b = Math.floor(((zm + 1) / 2) * BUCKETS);
        if (b < 0) b = 0; else if (b >= BUCKETS) b = BUCKETS - 1;
        buckets[b].push(prev[0], prev[1], cur[0], cur[1]);
        prev = cur;
      }
    }
    for (let b = 0; b < BUCKETS; b++) {
      const seg = buckets[b];
      if (!seg.length) continue;
      const t = b / (BUCKETS - 1);
      ctx.strokeStyle = `rgba(56,189,248,${(0.055 + t * 0.27).toFixed(3)})`;
      ctx.lineWidth = 0.6 + t * 0.5;
      ctx.beginPath();
      for (let i = 0; i < seg.length; i += 4) {
        ctx.moveTo(seg[i], seg[i + 1]);
        ctx.lineTo(seg[i + 2], seg[i + 3]);
      }
      ctx.stroke();
    }

    // Orbit rings.
    for (const orb of orbits) {
      let prev = project(orb.pts[0], sy, cyw, sp, cp);
      for (let i = 1; i < orb.pts.length; i++) {
        const cur = project(orb.pts[i], sy, cyw, sp, cp);
        const zm = (prev[2] + cur[2]) / 2;
        const depth = (zm + 1) / 2;
        ctx.strokeStyle = `rgba(125,211,252,${(orb.alpha * (0.22 + depth * 0.95)).toFixed(3)})`;
        ctx.lineWidth = 0.7 + depth * 0.9;
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(cur[0], cur[1]);
        ctx.stroke();
        prev = cur;
      }
    }

    // Network links between nodes.
    ctx.lineWidth = 0.9;
    for (const [a, bIdx] of links) {
      const p1 = project(nodes[a], sy, cyw, sp, cp);
      const p2 = project(nodes[bIdx], sy, cyw, sp, cp);
      const zm = (p1[2] + p2[2]) / 2;
      if (zm < -0.15) continue;
      const alpha = 0.10 + ((zm + 1) / 2) * 0.34;
      ctx.strokeStyle = `rgba(125,211,252,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }

    // Nodes.
    for (let i = 0; i < nodes.length; i++) {
      const p = project(nodes[i], sy, cyw, sp, cp);
      const depth = (p[2] + 1) / 2;
      if (p[2] < -0.45) continue;
      const r = (0.9 + depth * 1.9) * (small ? 0.85 : 1);
      ctx.fillStyle = `rgba(186,230,253,${(0.18 + depth * 0.72).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p[0], p[1], r, 0, TAU);
      ctx.fill();
      if (depth > 0.82) {
        ctx.fillStyle = `rgba(56,189,248,${((depth - 0.82) * 0.5).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p[0], p[1], r * 3.4, 0, TAU);
        ctx.fill();
      }
    }

    // Dust.
    for (const d of dust) {
      const p = project(d, sy, cyw, sp, cp);
      const depth = (p[2] + 1) / 2;
      ctx.fillStyle = `rgba(56,189,248,${(0.06 + depth * 0.34) * d[3]})`;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 0.7 + depth * 1.1, 0, TAU);
      ctx.fill();
    }
  }

  function frame(now) {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    yaw += dt * 0.085;                 // slow and steady
    yawOff += (targetYawOff - yawOff) * 0.045;
    pitchOff += (targetPitchOff - pitchOff) * 0.045;
    pitch = baseTilt + pitchOff;
    const saved = yaw;
    yaw = saved + yawOff;
    draw();
    yaw = saved;
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  if (!resize()) {
    // Container not laid out yet; try once more next frame.
    requestAnimationFrame(() => { if (resize()) reduced ? draw() : start(); });
  } else if (reduced) {
    draw();
  } else {
    start();
  }

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (resize()) draw(); }, 150);
  };
  window.addEventListener('resize', onResize, { passive: true });

  // Gentle pointer parallax, desktop pointers only.
  let pointerBound = false;
  if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    pointerBound = true;
    window.addEventListener('pointermove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetYawOff = nx * 0.22;
      targetPitchOff = ny * 0.16;
    }, { passive: true });
  }

  // Never burn cycles off screen or in a background tab.
  const vis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', vis);

  let io = null;
  if ('IntersectionObserver' in window && !reduced) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? start() : stop()));
    }, { threshold: 0.01 });
    io.observe(canvas);
  }

  return {
    stop,
    destroy() {
      stop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', vis);
      if (io) io.disconnect();
      void pointerBound;
    }
  };
}
