/* Shared render engine for every section visual.

   Each scene is real 3D: points are rotated by yaw and pitch and projected
   through a perspective camera, with brightness and size driven by depth.
   Everything draws on a 2D canvas with additive blending for the glow, so
   there is no WebGL requirement, no framework and no build step.

   Cost control lives here rather than in each scene:
     - a scene only animates while it is on screen (IntersectionObserver)
     - every scene stops when the tab is hidden
     - device pixel ratio is capped, lower on small screens
     - reduced motion draws one still frame and never starts a loop
     - glow sprites are rendered once and reused with drawImage */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  /* Seeded random so every visit renders the same composition. */
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  /* Radial glow sprite, cached by colour and size. */
  var spriteCache = {};
  function sprite(rgb, size, core) {
    var key = rgb + '|' + size + '|' + (core || 0);
    if (spriteCache[key]) return spriteCache[key];
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    var h = size / 2;
    var grad = g.createRadialGradient(h, h, 0, h, h, h);
    grad.addColorStop(0, 'rgba(255,255,255,' + (core == null ? 1 : core) + ')');
    grad.addColorStop(0.12, 'rgba(' + rgb + ',0.95)');
    grad.addColorStop(0.35, 'rgba(' + rgb + ',0.35)');
    grad.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    spriteCache[key] = c;
    return c;
  }

  function rotate(p, cy, sy, cx, sx) {
    /* yaw around Y, then pitch around X */
    var x = p[0] * cy + p[2] * sy;
    var z = -p[0] * sy + p[2] * cy;
    var y = p[1] * cx - z * sx;
    z = p[1] * sx + z * cx;
    return [x, y, z];
  }

  /* Perspective camera. Returns a projector bound to the current rotation. */
  function camera(yaw, pitch, dist, scale, ox, oy) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    return function (p, out) {
      var x = p[0] * cy + p[2] * sy;
      var z = -p[0] * sy + p[2] * cy;
      var y = p[1] * cx - z * sx;
      z = p[1] * sx + z * cx;
      var k = dist / (dist - z);
      out = out || {};
      out.x = ox + x * scale * k;
      out.y = oy - y * scale * k;
      out.z = z;
      out.k = k;
      return out;
    };
  }

  function fibonacciSphere(n) {
    var pts = [];
    var g = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;
      var r = Math.sqrt(1 - y * y);
      var t = g * i;
      pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
    }
    return pts;
  }

  /* Size the canvas backing store to its CSS box. */
  function fit(canvas, ctx) {
    var cap = small ? 1.5 : 1.75;
    var dpr = Math.min(window.devicePixelRatio || 1, cap);
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h, dpr: dpr };
  }

  /* Mount a scene on a canvas.
     factory(ctx, env) returns { resize(size), frame(t, dt, size) }.
     env carries the shared flags and the pointer position in -1..1. */
  var hidden = false;
  var running = [];
  document.addEventListener('visibilitychange', function () {
    hidden = document.hidden;
    running.forEach(function (m) { if (!hidden) m.kick(); });
  });

  function mount(canvas, factory) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var env = { reduced: reduced, small: small, fine: fine, px: 0, py: 0, tx: 0, ty: 0 };
    var scene;
    try { scene = factory(ctx, env, canvas); } catch (e) { canvas.classList.add('scene-failed'); return null; }
    var size = fit(canvas, ctx);
    var visible = false, raf = 0, last = 0, t = 0;
    /* adaptive rate: if the device cannot hold ~40 fps with this scene
       running, it drops to every other frame and stays there */
    var prev = 0, ema = 16, frames = 0, half = false;

    function draw(dt) {
      env.px += (env.tx - env.px) * Math.min(1, dt * 3);
      env.py += (env.ty - env.py) * Math.min(1, dt * 3);
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, size.w, size.h);
      scene.frame(t, dt, size);
    }

    function loop(now) {
      raf = 0;
      if (!visible || hidden) return;
      if (prev) { ema = ema * 0.94 + (now - prev) * 0.06; frames++; }
      prev = now;
      if (!half && frames > 90 && ema > 25) half = true;
      if (half && (frames & 1)) { raf = requestAnimationFrame(loop); return; }
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      t += dt;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }

    var m = {
      kick: function () {
        if (reduced || raf || !visible || hidden) return;
        last = 0; prev = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    running.push(m);

    function resize() {
      size = fit(canvas, ctx);
      if (scene.resize) scene.resize(size);
      if (reduced || !visible) { t = 6; draw(0); }
    }
    if (scene.resize) scene.resize(size);
    t = reduced ? 6 : 0;
    draw(0);

    if ('ResizeObserver' in window) {
      var pending = 0;
      new ResizeObserver(function () {
        cancelAnimationFrame(pending);
        pending = requestAnimationFrame(resize);
      }).observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) m.kick();
      }, { rootMargin: '120px 0px' }).observe(canvas);
    } else {
      visible = true; m.kick();
    }

    if (fine && !reduced) {
      var host = canvas.parentElement;
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        env.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        env.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      });
      host.addEventListener('pointerleave', function () { env.tx = 0; env.ty = 0; });
    }
    return m;
  }

  /* Position of an element's centre relative to a canvas, in CSS pixels. */
  function anchorOf(el, canvas) {
    var a = el.getBoundingClientRect(), c = canvas.getBoundingClientRect();
    return { x: a.left + a.width / 2 - c.left, y: a.top + a.height / 2 - c.top, w: a.width, h: a.height };
  }

  window.BK = {
    TAU: TAU, reduced: reduced, small: small, fine: fine,
    rng: rng, sprite: sprite, rotate: rotate, camera: camera,
    fibonacciSphere: fibonacciSphere, mount: mount, anchorOf: anchorOf,
    scenes: {}
  };
})();
