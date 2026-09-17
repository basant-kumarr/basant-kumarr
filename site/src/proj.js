/* Shared 3D helpers.
   Small on purpose: rotation and perspective projection are the only maths the
   scenes actually share, so this stays a handful of functions rather than an
   engine. */

export const TAU = Math.PI * 2;

export const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Evenly distributed points on a unit sphere. */
export function fibonacciSphere(n) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = golden * i;
    pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  return pts;
}

/** Rotate about Y then X, then project through a perspective camera. */
export function makeProjector(cx, cy, scale, cam = 3.2) {
  return function project(p, sy, cy_, sp, cp) {
    const x1 = p[0] * cy_ + p[2] * sy;
    const z1 = -p[0] * sy + p[2] * cy_;
    const y2 = p[1] * cp - z1 * sp;
    const z2 = p[1] * sp + z1 * cp;
    const k = cam / (cam - z2);
    return [cx + x1 * scale * k, cy + y2 * scale * k, z2, k];
  };
}

/** Size a canvas to its CSS box, capping DPR. Returns false if not laid out. */
export function fitCanvas(canvas, ctx, maxDpr = 2) {
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w: r.width, h: r.height, dpr };
}

/**
 * Runs a draw callback on rAF, pausing off screen and in background tabs.
 * Under reduced motion it draws exactly one frame and never starts a loop.
 */
export function createLoop(canvas, draw, { reduced = false } = {}) {
  let raf = 0;
  let running = false;
  let last = 0;

  function frame(now) {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    draw(dt, now);
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

  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);

  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
      { threshold: 0.01 }
    );
    io.observe(canvas);
  } else if (!reduced) {
    start();
  }

  if (reduced) draw(0, 0);

  return {
    start,
    stop,
    destroy() {
      stop();
      document.removeEventListener('visibilitychange', onVis);
      if (io) io.disconnect();
    }
  };
}
