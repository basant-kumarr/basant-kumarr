/* 01 Home: the neural brain inside a data globe.
   About two thousand points sampled on two folded hemispheres, a cerebellum
   and a brain stem, wired to their nearest neighbours. Signals travel the
   wiring, two orbital rings carry particle streams, and every label around
   it is tied to the nearest point on the visible side of the brain. */
(function () {
  'use strict';
  var BK = window.BK, TAU = BK.TAU;

  BK.scenes.brain = function (ctx, env, canvas) {
    var R = BK.rng(11);
    var N = env.small ? 1150 : 2300;
    var pts = [];

    function folds(x, y, z) {
      return 0.05 * Math.sin(12 * x + 4 * Math.sin(7 * z)) * Math.cos(10 * y + 3 * Math.sin(8 * x)) +
             0.028 * Math.sin(19 * z + 6 * y) * Math.cos(5 * x);
    }

    function randDir() {
      var u = R() * 2 - 1, a = R() * TAU, s = Math.sqrt(1 - u * u);
      return [Math.cos(a) * s, u, Math.sin(a) * s];
    }

    /* hemispheres */
    var nHemi = Math.round(N * 0.78);
    for (var i = 0; i < nHemi; i++) {
      var side = i % 2 ? 1 : -1;
      var d = randDir();
      var x = d[0], y = d[1], z = d[2];
      if (x * side < 0) x *= 0.32;          /* flat medial wall between hemispheres */
      if (y < 0) y *= 0.62;                  /* flatter underside */
      var f = 1 + folds(x, y, z);
      var p = [side * 0.215 + x * 0.41 * f, 0.1 + y * 0.5 * f, z * 0.76 * f];
      /* temporal lobe: pull the lower sides forward and down */
      if (y < -0.1 && Math.abs(x) > 0.5) { p[1] -= 0.06; p[2] += 0.04; }
      pts.push({ p: p, b: R() < 0.09 ? 1 : 0 });
    }
    /* cerebellum, horizontally striated */
    var nCb = Math.round(N * 0.14);
    for (i = 0; i < nCb; i++) {
      d = randDir();
      var st = 1 + 0.06 * Math.sin(d[1] * 26);
      pts.push({ p: [d[0] * 0.38 * st, -0.29 + d[1] * 0.16, -0.46 + d[2] * 0.25 * st], b: R() < 0.06 ? 1 : 0 });
    }
    /* brain stem */
    var nSt = N - nHemi - nCb;
    for (i = 0; i < nSt; i++) {
      var tt = R(), a = R() * TAU, r = 0.085 * (1 - tt * 0.25);
      pts.push({ p: [Math.cos(a) * r, -0.2 - tt * 0.62, -0.17 - tt * 0.12 + Math.sin(a) * r], b: 0 });
    }

    /* wiring: up to four nearest neighbours under a threshold */
    var thr = env.small ? 0.13 : 0.095, thr2 = thr * thr;
    var edges = [], adj = pts.map(function () { return []; });
    for (i = 0; i < pts.length; i++) {
      var pi = pts[i].p, found = 0;
      for (var j = i + 1; j < pts.length && found < 4; j++) {
        var pj = pts[j].p;
        var dx = pi[0] - pj[0], dy = pi[1] - pj[1], dz = pi[2] - pj[2];
        if (dx * dx + dy * dy + dz * dz < thr2) {
          adj[i].push(edges.length); adj[j].push(edges.length);
          edges.push([i, j]); found++;
        }
      }
    }

    /* globe shell: latitude and longitude dots plus a sparse scatter */
    var shell = [];
    var GR = 1.38;
    for (var la = -60; la <= 60; la += env.small ? 30 : 20) {
      var lr = Math.cos(la * Math.PI / 180), ly = Math.sin(la * Math.PI / 180);
      for (var k = 0; k < 90; k++) {
        var aa = k / 90 * TAU;
        shell.push([Math.cos(aa) * lr * GR, ly * GR, Math.sin(aa) * lr * GR]);
      }
    }
    for (var lo = 0, nlo = env.small ? 8 : 12; lo < nlo; lo++) {
      var ao = lo / nlo * Math.PI;
      for (k = 0; k < 60; k++) {
        var b = k / 60 * TAU;
        shell.push([Math.cos(b) * Math.cos(ao) * GR, Math.sin(b) * GR, Math.cos(b) * Math.sin(ao) * GR]);
      }
    }
    BK.fibonacciSphere(env.small ? 260 : 600).forEach(function (q) {
      shell.push([q[0] * GR * 1.02, q[1] * GR * 1.02, q[2] * GR * 1.02]);
    });

    /* orbital rings */
    function ring(radius, tiltX, tiltZ) {
      var cz = Math.cos(tiltZ), sz = Math.sin(tiltZ), cx = Math.cos(tiltX), sx = Math.sin(tiltX);
      return function (ang) {
        var x = Math.cos(ang) * radius, y = 0, z = Math.sin(ang) * radius;
        var y1 = y * cx - z * sx, z1 = y * sx + z * cx;
        return [x * cz - y1 * sz, x * sz + y1 * cz, z1];
      };
    }
    var rings = [
      { f: ring(1.8, 0.32, 0.22), rgb: '255,176,64', speed: 0.22, n: env.small ? 26 : 48 },
      { f: ring(1.6, -0.26, -0.3), rgb: '80,200,255', speed: -0.16, n: env.small ? 20 : 36 }
    ];
    rings.forEach(function (rg, k) {
      rg.parts = [];
      for (var q = 0; q < rg.n; q++) rg.parts.push({ a: R() * TAU, s: 0.6 + R() * 0.8, l: R() });
    });

    /* signals along the wiring */
    var signals = [];
    for (i = 0; i < (env.small ? 18 : 42); i++) signals.push({ e: (R() * edges.length) | 0, t: R(), dir: 1, v: 1.2 + R() * 1.6 });

    /* background stars, fixed in screen space with slight parallax */
    var stars = [];
    for (i = 0; i < (env.small ? 90 : 200); i++) stars.push({ x: R(), y: R(), z: 0.2 + R() * 0.8, tw: R() * TAU });

    var tails = env.small ? 3 : 5;
    var labels = Array.prototype.slice.call(canvas.parentElement.querySelectorAll('[data-label]'));
    var labelPos = [];
    var proj = pts.map(function () { return { x: 0, y: 0, z: 0, k: 1 }; });
    var tmp = {};
    var sNode = BK.sprite('90,200,255', 32), sHot = BK.sprite('150,225,255', 48), sGold = BK.sprite('255,180,70', 32), sCyan = BK.sprite('80,220,255', 24);
    rings[0].sp = sGold; rings[1].sp = sCyan;
    var W = 0, H = 0, cxp = 0, cyp = 0, scale = 1;

    function resize(size) {
      W = size.w; H = size.h;
      scale = Math.min(W * 0.36, H * 0.39);
      cxp = W * 0.5; cyp = H * 0.5;
      labelPos = labels.map(function (el) { return BK.anchorOf(el, canvas); });
    }

    function frame(t, dt) {
      var yaw = t * 0.16 + 0.7 + env.px * 0.35;
      var pitch = 0.28 + env.py * 0.12;
      var cam = BK.camera(yaw, pitch, 4.2, scale, cxp, cyp);
      ctx.globalCompositeOperation = 'lighter';

      /* stars */
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = 0.25 + 0.35 * s.z * (0.6 + 0.4 * Math.sin(t * 1.3 + s.tw));
        ctx.fillStyle = 'rgba(170,210,255,' + a.toFixed(3) + ')';
        var sx = s.x * W - env.px * 10 * s.z, sy = s.y * H - env.py * 8 * s.z;
        ctx.fillRect(sx, sy, s.z * 1.6, s.z * 1.6);
      }

      /* globe shell, dimmer at the back: one projection pass into two paths */
      var shellYaw = BK.camera(yaw * 0.6 + 0.4, pitch, 4.2, scale, cxp, cyp);
      var front = new Path2D(), back = new Path2D();
      for (i = 0; i < shell.length; i++) {
        shellYaw(shell[i], tmp);
        if (tmp.z >= 0) { var r1 = 0.6 + tmp.z * 0.5; front.rect(tmp.x, tmp.y, r1, r1); }
        else back.rect(tmp.x, tmp.y, 0.8, 0.8);
      }
      ctx.fillStyle = 'rgba(80,160,255,0.36)'; ctx.fill(front);
      ctx.fillStyle = 'rgba(70,150,255,0.13)'; ctx.fill(back);

      /* rings, back halves first */
      var ringCam = BK.camera(0.25 + env.px * 0.2, 0.18 + env.py * 0.1, 4.2, scale, cxp, cyp);
      rings.forEach(function (rg) {
        ctx.strokeStyle = 'rgba(' + rg.rgb + ',0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var q = 0; q <= 120; q++) {
          ringCam(rg.f(q / 120 * TAU), tmp);
          if (q === 0) ctx.moveTo(tmp.x, tmp.y); else ctx.lineTo(tmp.x, tmp.y);
        }
        ctx.stroke();
        for (q = 0; q < rg.parts.length; q++) {
          var pp = rg.parts[q];
          pp.a += rg.speed * pp.s * dt;
          for (var tail = 0; tail < tails; tail++) {
            ringCam(rg.f(pp.a - tail * 0.018 * Math.sign(rg.speed)), tmp);
            var al = (1 - tail / tails) * (0.35 + 0.65 * pp.l) * (tmp.z > 0 ? 1 : 0.45);
            var sz = (tail ? 6 : 14) * tmp.k;
            ctx.globalAlpha = al;
            ctx.drawImage(rg.sp, tmp.x - sz / 2, tmp.y - sz / 2, sz, sz);
          }
        }
        ctx.globalAlpha = 1;
      });

      /* project brain */
      for (i = 0; i < pts.length; i++) cam(pts[i].p, proj[i]);

      /* wiring and points in four depth buckets, built in one pass each */
      var wp = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (var e = 0; e < edges.length; e++) {
        var A = proj[edges[e][0]], B = proj[edges[e][1]];
        var bi = Math.max(0, Math.min(3, ((A.z + B.z) / 2 + 1) * 2 | 0));
        wp[bi].moveTo(A.x, A.y); wp[bi].lineTo(B.x, B.y);
      }
      for (var bkt = 0; bkt < 4; bkt++) {
        ctx.strokeStyle = 'rgba(70,175,255,' + (0.07 + bkt * 0.075).toFixed(3) + ')';
        ctx.lineWidth = 0.6 + bkt * 0.15;
        ctx.stroke(wp[bkt]);
      }
      var pp = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (i = 0; i < pts.length; i++) {
        var P = proj[i];
        var bj = Math.max(0, Math.min(3, (P.z + 1) * 2 | 0)), r = 0.7 + bj * 0.35;
        pp[bj].rect(P.x - r / 2, P.y - r / 2, r, r);
      }
      for (bkt = 0; bkt < 4; bkt++) {
        ctx.fillStyle = 'rgba(140,215,255,' + (0.25 + bkt * 0.18).toFixed(3) + ')';
        ctx.fill(pp[bkt]);
      }
      for (i = 0; i < pts.length; i++) {
        if (!pts[i].b) continue;
        P = proj[i];
        var g = (P.z + 1) / 2;
        ctx.globalAlpha = 0.25 + g * 0.6;
        var gs = 8 + g * 10;
        ctx.drawImage(sNode, P.x - gs / 2, P.y - gs / 2, gs, gs);
      }
      ctx.globalAlpha = 1;

      /* signals */
      for (i = 0; i < signals.length; i++) {
        var sg = signals[i];
        sg.t += sg.v * dt;
        if (sg.t >= 1) {
          var end = edges[sg.e][sg.dir > 0 ? 1 : 0];
          var nbrs = adj[end];
          var next = nbrs[(R() * nbrs.length) | 0];
          sg.dir = edges[next][0] === end ? 1 : -1;
          sg.e = next; sg.t = 0;
        }
        var ed = edges[sg.e];
        var a0 = proj[ed[sg.dir > 0 ? 0 : 1]], a1 = proj[ed[sg.dir > 0 ? 1 : 0]];
        var x = a0.x + (a1.x - a0.x) * sg.t, y = a0.y + (a1.y - a0.y) * sg.t;
        var zz2 = (a0.z + a1.z) / 2;
        ctx.globalAlpha = 0.35 + 0.6 * (zz2 + 1) / 2;
        ctx.drawImage(sHot, x - 9, y - 9, 18, 18);
      }
      ctx.globalAlpha = 1;

      /* core glow */
      var cg = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, scale * 1.1);
      cg.addColorStop(0, 'rgba(40,140,255,0.22)');
      cg.addColorStop(0.5, 'rgba(30,90,220,0.08)');
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(cxp - scale * 1.2, cyp - scale * 1.2, scale * 2.4, scale * 2.4);

      /* leader lines from each label to the nearest visible brain point */
      for (var l = 0; l < labelPos.length; l++) {
        var L = labelPos[l];
        var best = -1, bd = 1e12;
        for (i = 0; i < pts.length; i += 3) {
          P = proj[i];
          if (P.z < 0.15) continue;
          var ddx = P.x - L.x, ddy = P.y - L.y, dd = ddx * ddx + ddy * ddy;
          if (dd < bd) { bd = dd; best = i; }
        }
        if (best < 0) continue;
        P = proj[best];
        var sxl = L.x + (P.x > L.x ? L.w / 2 : -L.w / 2);
        var grad = ctx.createLinearGradient(sxl, L.y, P.x, P.y);
        grad.addColorStop(0, 'rgba(255,190,90,0.75)');
        grad.addColorStop(1, 'rgba(120,210,255,0.55)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sxl, L.y);
        ctx.lineTo(sxl + (P.x - sxl) * 0.35, L.y);
        ctx.lineTo(P.x, P.y);
        ctx.stroke();
        ctx.drawImage(sGold, sxl - 7, L.y - 7, 14, 14);
        ctx.drawImage(sHot, P.x - 10, P.y - 10, 20, 20);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    return { resize: resize, frame: frame };
  };
})();
