/* Project visuals. Each one is a lit 3D model rather than a picture:
     BeBeyond      muscle-fibre figure built from capsules, shaded by a key
                   light and rim-lit, with a scan line passing over it
     Age Friendly  Ireland as a tilted point-cloud map with linked towns and
                   a 3D bar chart beside it
     Fraud         a red transaction network with flagged nodes, guarded by
                   a bevelled shield and lock
     Forecast      perspective bar series, a demand line and a forecast fan
   The figures in these scenes are decorative, not project results. */
(function () {
  'use strict';
  var BK = window.BK, TAU = BK.TAU;

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  /* ---------------- BeBeyond: anatomical figure ---------------- */
  BK.scenes.body = function (ctx, env) {
    var R = BK.rng(71), P = [];
    function capsule(a, b, ra, rb, n, bulge) {
      var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ax = norm(d);
      var ref = Math.abs(ax[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
      var u = norm(cross(ax, ref)), v = cross(ax, u);
      for (var i = 0; i < n; i++) {
        var t = R(), th = R() * TAU;
        var r = (ra + (rb - ra) * t) * (1 + (bulge || 0.18) * Math.sin(Math.PI * t));
        var nn = [u[0] * Math.cos(th) + v[0] * Math.sin(th), u[1] * Math.cos(th) + v[1] * Math.sin(th), u[2] * Math.cos(th) + v[2] * Math.sin(th)];
        P.push({ p: [a[0] + d[0] * t + nn[0] * r, a[1] + d[1] * t + nn[1] * r, a[2] + d[2] * t + nn[2] * r], n: nn, f: ax });
      }
    }
    function ellip(c, rad, n, fibre) {
      for (var i = 0; i < n; i++) {
        var z = R() * 2 - 1, a = R() * TAU, s = Math.sqrt(1 - z * z), dd = [Math.cos(a) * s, z, Math.sin(a) * s];
        var nn = norm([dd[0] / rad[0], dd[1] / rad[1], dd[2] / rad[2]]);
        var f = fibre === 'h' ? norm(cross(nn, [0, 1, 0])) : norm(cross(nn, [1, 0, 0]));
        P.push({ p: [c[0] + dd[0] * rad[0], c[1] + dd[1] * rad[1], c[2] + dd[2] * rad[2]], n: nn, f: f });
      }
    }
    var k = env.small ? 0.9 : 1.5;
    function n(x) { return Math.round(x * k); }
    ellip([0, 1.6, 0], [0.1, 0.125, 0.115], n(110), 'v');
    capsule([0, 1.41, 0], [0, 1.5, 0], 0.055, 0.05, n(30));
    ellip([0, 1.22, 0.01], [0.19, 0.17, 0.12], n(200), 'h');
    ellip([0, 0.98, 0.01], [0.15, 0.15, 0.1], n(130), 'v');
    ellip([0, 0.8, 0], [0.17, 0.1, 0.11], n(90), 'h');
    [-1, 1].forEach(function (s) {
      ellip([s * 0.09, 1.27, 0.08], [0.09, 0.06, 0.05], n(60), 'h');
      ellip([s * 0.21, 1.35, 0], [0.075, 0.075, 0.075], n(60), 'v');
      capsule([s * 0.24, 1.32, 0], [s * 0.3, 1.03, 0.02], 0.058, 0.045, n(90), 0.25);
      capsule([s * 0.3, 1.03, 0.02], [s * 0.34, 0.78, 0.06], 0.047, 0.032, n(70), 0.2);
      ellip([s * 0.35, 0.71, 0.07], [0.03, 0.05, 0.022], n(16), 'v');
      capsule([s * 0.09, 0.78, 0], [s * 0.11, 0.42, 0.02], 0.088, 0.055, n(140), 0.2);
      capsule([s * 0.11, 0.42, 0.02], [s * 0.12, 0.05, -0.01], 0.058, 0.034, n(100), 0.3);
      ellip([s * 0.12, 0.02, 0.04], [0.035, 0.025, 0.075], n(22), 'h');
    });
    var L = norm([-0.5, 0.6, 0.8]);
    var skinRGB = ['70,16,8', '125,34,14', '185,66,26', '235,112,52', '255,170,105'];
    var skin = skinRGB.map(function (c) {
      var cv = document.createElement('canvas'); cv.width = cv.height = 16;
      var g = cv.getContext('2d'), gr = g.createRadialGradient(8, 8, 0, 8, 8, 8);
      gr.addColorStop(0, 'rgba(' + c + ',0.9)'); gr.addColorStop(0.6, 'rgba(' + c + ',0.45)'); gr.addColorStop(1, 'rgba(' + c + ',0)');
      g.fillStyle = gr; g.fillRect(0, 0, 16, 16); return cv;
    });
    var fib = ['rgba(40,8,4,0.5)', 'rgba(70,16,8,0.5)', 'rgba(110,30,12,0.45)', 'rgba(150,50,20,0.4)', 'rgba(255,220,180,0.45)'];
    var W, H, sc, ox, oy, tmp = {}, tmp2 = {};
    var sC = BK.sprite('80,200,255', 20);
    return {
      resize: function (s) { W = s.w; H = s.h; sc = H / 1.95; ox = W * 0.5; oy = H * 0.93; },
      frame: function (t) {
        var yaw = Math.sin(t * 0.45) * 0.7 + 0.25 + env.px * 0.3;
        var cy = Math.cos(yaw), sy = Math.sin(yaw);
        var cam = BK.camera(yaw, 0.06, 6, sc, ox, oy + -0.0 * sc);
        var paths = [[], [], [], [], []], rims = [];
        for (var i = 0; i < P.length; i++) {
          var q = P[i];
          var nz = -q.n[0] * sy + q.n[2] * cy, nx = q.n[0] * cy + q.n[2] * sy;
          if (nz < -0.35) continue;
          var lum = Math.max(0, nx * L[0] + q.n[1] * L[1] + nz * L[2]);
          cam(q.p, tmp);
          cam([q.p[0] + q.f[0] * 0.04, q.p[1] + q.f[1] * 0.04, q.p[2] + q.f[2] * 0.04], tmp2);
          var b = Math.min(4, (lum * 4.6) | 0);
          paths[b].push(tmp.x, tmp.y, tmp2.x, tmp2.y);
          if (Math.abs(nz) < 0.22 && i % 2 === 0) rims.push(tmp.x, tmp.y);
        }
        /* skin: overlapping soft discs shaded by the key light give a solid form */
        for (var bk = 0; bk < 5; bk++) {
          var arr = paths[bk], spr = skin[bk], d = env.small ? 7 : 8;
          for (var j = 0; j < arr.length; j += 4) ctx.drawImage(spr, arr[j] - d / 2, arr[j + 1] - d / 2, d, d);
        }
        /* muscle fibres */
        for (bk = 0; bk < 5; bk++) {
          arr = paths[bk];
          ctx.strokeStyle = fib[bk]; ctx.lineWidth = 0.6; ctx.beginPath();
          for (j = 0; j < arr.length; j += 8) { ctx.moveTo(arr[j], arr[j + 1]); ctx.lineTo(arr[j + 2], arr[j + 3]); }
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(90,200,255,0.55)'; ctx.beginPath();
        for (j = 0; j < rims.length; j += 2) ctx.rect(rims[j], rims[j + 1], 1.3, 1.3);
        ctx.fill();
        /* scan line */
        var sy2 = oy - ((t * 0.25) % 1) * sc * 1.8;
        var g = ctx.createLinearGradient(0, sy2 - 10, 0, sy2 + 10);
        g.addColorStop(0, 'rgba(80,200,255,0)'); g.addColorStop(0.5, 'rgba(80,200,255,0.35)'); g.addColorStop(1, 'rgba(80,200,255,0)');
        ctx.fillStyle = g; ctx.fillRect(ox - sc * 0.5, sy2 - 10, sc, 20);
        /* floor ring */
        ctx.strokeStyle = 'rgba(80,200,255,0.45)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(ox, oy + 2, sc * 0.32, sc * 0.06, 0, 0, TAU); ctx.stroke();
        ctx.drawImage(sC, ox - 10 + Math.cos(t) * sc * 0.32, oy + 2 + Math.sin(t) * sc * 0.06 - 10, 20, 20);
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  };

  /* ---------------- Age Friendly Ireland: map and bars ---------------- */
  var IRELAND = [[-7.37,55.38],[-7.0,55.25],[-6.45,55.22],[-6.15,55.22],[-5.98,55.05],[-5.75,54.8],[-5.85,54.65],[-5.47,54.48],[-5.6,54.25],[-6.08,54.03],[-6.25,53.88],[-6.2,53.6],[-6.08,53.36],[-6.0,53.1],[-6.02,52.95],[-6.15,52.62],[-6.35,52.25],[-6.36,52.17],[-6.9,52.15],[-7.05,52.13],[-7.6,51.97],[-8.2,51.8],[-8.35,51.73],[-8.8,51.58],[-9.4,51.47],[-9.8,51.45],[-10.2,51.6],[-9.85,51.78],[-10.3,51.92],[-10.45,52.12],[-9.9,52.3],[-9.85,52.56],[-9.5,52.62],[-9.9,52.58],[-9.45,52.95],[-9.05,53.15],[-9.0,53.26],[-9.6,53.24],[-10.1,53.42],[-9.95,53.7],[-9.9,54.0],[-10.05,54.25],[-9.35,54.3],[-8.65,54.25],[-8.5,54.32],[-8.2,54.5],[-8.75,54.65],[-8.45,54.85],[-8.5,55.0],[-8.2,55.18],[-7.7,55.25],[-7.37,55.38]];
  var TOWNS = [[-6.26,53.35,1],[-8.47,51.9,0],[-9.05,53.27,0],[-8.63,52.66,0],[-7.11,52.26,0],[-5.93,54.6,0],[-7.31,55.0,0],[-8.47,54.27,0],[-7.25,52.65,0],[-7.94,53.42,0],[-6.59,53.38,1]];
  function geo(lon, lat) { return [(lon + 7.9) * 0.6 / 2.1, (lat - 53.4) / 2.1]; }
  function inPoly(x, y, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  BK.scenes.ireland = function (ctx, env) {
    var R = BK.rng(81);
    var poly = IRELAND.map(function (p) { return geo(p[0], p[1]); });
    var pts = [], step = env.small ? 0.045 : 0.032;
    for (var y = -1; y <= 1; y += step) for (var x = -0.9; x <= 0.9; x += step) {
      var jx = x + (R() - 0.5) * step * 0.6, jy = y + (R() - 0.5) * step * 0.6;
      if (inPoly(jx, jy, poly)) pts.push({ p: [jx, jy, 0], b: R() });
    }
    var outline = poly.map(function (p) { return [p[0], p[1], 0]; });
    var towns = TOWNS.map(function (t) { var g = geo(t[0], t[1]); return { p: [g[0], g[1], 0], hub: t[2], ph: R() * TAU }; });
    var links = [];
    towns.forEach(function (tw, i) { if (!tw.hub) links.push({ a: towns[0], b: tw, t: R(), v: 0.25 + R() * 0.3 }); });
    var bars = [0.34, 0.5, 0.42, 0.68, 0.56, 0.86, 0.62, 0.95];
    var cols = [['56,198,255', '20,90,200'], ['255,179,71', '180,90,10'], ['47,123,255', '15,50,150']];
    var W, H, tmp = {}, tmp2 = {};
    var sC = BK.sprite('90,200,255', 24), sG = BK.sprite('255,190,90', 32), sW = BK.sprite('200,235,255', 40);
    return {
      resize: function (s) { W = s.w; H = s.h; },
      frame: function (t, dt) {
        var mapX = W * 0.7, mapY = H * 0.44, sc = Math.min(H * 0.42, W * 0.42);
        var cam = BK.camera(-0.5 + Math.sin(t * 0.35) * 0.22 + env.px * 0.2, 0.12 + env.py * 0.08, 4, sc, mapX, mapY);
        ctx.globalCompositeOperation = 'lighter';
        /* land points */
        for (var bk = 0; bk < 3; bk++) {
          ctx.fillStyle = ['rgba(60,140,255,0.35)', 'rgba(110,190,255,0.6)', 'rgba(255,200,120,0.85)'][bk];
          ctx.beginPath();
          for (var i = 0; i < pts.length; i++) {
            var q = pts[i], tw = q.b > 0.93 ? 2 : q.b > 0.55 ? 1 : 0;
            if (tw !== bk) continue;
            cam(q.p, tmp);
            var s = 1 + tw * 0.5 + (tw === 2 ? 0.8 * Math.sin(t * 2 + q.b * 40) : 0);
            ctx.rect(tmp.x, tmp.y, s, s);
          }
          ctx.fill();
        }
        /* coastline */
        ctx.strokeStyle = 'rgba(110,200,255,0.55)'; ctx.lineWidth = 1; ctx.beginPath();
        outline.forEach(function (p, j) { cam(p, tmp); if (j) ctx.lineTo(tmp.x, tmp.y); else ctx.moveTo(tmp.x, tmp.y); });
        ctx.stroke();
        /* links with pulses */
        links.forEach(function (l) {
          l.t = (l.t + l.v * dt) % 1;
          ctx.strokeStyle = 'rgba(255,190,90,0.28)'; ctx.beginPath();
          for (var k = 0; k <= 16; k++) {
            var f = k / 16, h = Math.sin(Math.PI * f) * 0.14;
            cam([l.a.p[0] + (l.b.p[0] - l.a.p[0]) * f, l.a.p[1] + (l.b.p[1] - l.a.p[1]) * f, h], tmp);
            if (k) ctx.lineTo(tmp.x, tmp.y); else ctx.moveTo(tmp.x, tmp.y);
          }
          ctx.stroke();
          var h2 = Math.sin(Math.PI * l.t) * 0.14;
          cam([l.a.p[0] + (l.b.p[0] - l.a.p[0]) * l.t, l.a.p[1] + (l.b.p[1] - l.a.p[1]) * l.t, h2], tmp);
          ctx.drawImage(sG, tmp.x - 6, tmp.y - 6, 12, 12);
        });
        /* town beacons */
        towns.forEach(function (tw) {
          cam(tw.p, tmp); cam([tw.p[0], tw.p[1], tw.hub ? 0.22 : 0.12], tmp2);
          var g = ctx.createLinearGradient(tmp.x, tmp.y, tmp2.x, tmp2.y);
          g.addColorStop(0, 'rgba(120,210,255,0.9)'); g.addColorStop(1, 'rgba(120,210,255,0)');
          ctx.strokeStyle = g; ctx.lineWidth = tw.hub ? 2.2 : 1.4; ctx.beginPath(); ctx.moveTo(tmp.x, tmp.y); ctx.lineTo(tmp2.x, tmp2.y); ctx.stroke();
          var z = (tw.hub ? 26 : 16) * (0.8 + 0.2 * Math.sin(t * 2 + tw.ph));
          ctx.drawImage(tw.hub ? sW : sC, tmp.x - z / 2, tmp.y - z / 2, z, z);
        });
        ctx.globalCompositeOperation = 'source-over';

        /* 3D bar chart, lower left */
        var bx = W * 0.07, by = H * 0.82, bw = Math.min(W * 0.05, 18), gap = bw * 0.55, depth = bw * 0.55, maxH = H * 0.42;
        ctx.strokeStyle = 'rgba(90,160,255,0.18)'; ctx.lineWidth = 1;
        for (var gl = 0; gl <= 4; gl++) {
          var yy = by - gl * maxH / 4;
          ctx.beginPath(); ctx.moveTo(bx - 4, yy); ctx.lineTo(bx + bars.length * (bw + gap), yy); ctx.lineTo(bx + bars.length * (bw + gap) + depth, yy - depth * 0.6); ctx.stroke();
        }
        for (i = 0; i < bars.length; i++) {
          var c = cols[i % 3];
          var hgt = bars[i] * maxH * (0.94 + 0.06 * Math.sin(t * 1.2 + i));
          var x0 = bx + i * (bw + gap), y0 = by - hgt;
          var fg = ctx.createLinearGradient(0, y0, 0, by);
          fg.addColorStop(0, 'rgba(' + c[0] + ',1)'); fg.addColorStop(1, 'rgba(' + c[1] + ',0.75)');
          ctx.fillStyle = fg; ctx.fillRect(x0, y0, bw, hgt);
          ctx.fillStyle = 'rgba(' + c[1] + ',0.9)';
          ctx.beginPath(); ctx.moveTo(x0 + bw, y0); ctx.lineTo(x0 + bw + depth, y0 - depth * 0.6); ctx.lineTo(x0 + bw + depth, by - depth * 0.6); ctx.lineTo(x0 + bw, by); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + depth, y0 - depth * 0.6); ctx.lineTo(x0 + bw + depth, y0 - depth * 0.6); ctx.lineTo(x0 + bw, y0); ctx.closePath(); ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(sC, x0 + bw / 2 - 9, y0 - 12, 18, 18);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    };
  };

  /* ---------------- Fraud: network and shield ---------------- */
  BK.scenes.fraud = function (ctx, env) {
    var R = BK.rng(91), nodes = [], edges = [];
    var N = env.small ? 90 : 150;
    for (var i = 0; i < N; i++) {
      var z = R() * 2 - 1, a = R() * TAU, s = Math.sqrt(1 - z * z), r = 0.55 + R() * 0.55;
      nodes.push({ p: [Math.cos(a) * s * r * 1.5, z * r * 0.85, Math.sin(a) * s * r], flag: R() < 0.09, ph: R() * TAU });
    }
    for (i = 0; i < N; i++) {
      var best = [];
      for (var j = 0; j < N; j++) if (j !== i) {
        var A = nodes[i].p, B = nodes[j].p, d = (A[0] - B[0]) * (A[0] - B[0]) + (A[1] - B[1]) * (A[1] - B[1]) + (A[2] - B[2]) * (A[2] - B[2]);
        best.push([d, j]);
      }
      best.sort(function (x, y) { return x[0] - y[0]; });
      for (var k = 0; k < 3; k++) if (best[k][1] > i) edges.push([i, best[k][1]]);
    }
    var proj = nodes.map(function () { return {}; });
    var sR = BK.sprite('255,60,80', 32), sH = BK.sprite('255,140,150', 48), W, H;
    var shieldImg = null, dpr = 1;
    function renderShield(S, d) {
      var half = Math.ceil(S * 1.35), c = document.createElement('canvas');
      c.width = c.height = Math.ceil(half * 2 * d);
      var saved = ctx; ctx = c.getContext('2d'); ctx.scale(d, d);
      var cx = half, cy = half;
      shield(cx, cy, S);
      var body = ctx.createLinearGradient(cx - S, cy - S, cx + S, cy + S);
      body.addColorStop(0, '#5a0d1a'); body.addColorStop(0.5, '#2a0410'); body.addColorStop(1, '#14020a');
      ctx.fillStyle = body; ctx.fill();
      ctx.shadowColor = 'rgba(255,60,90,0.95)'; ctx.shadowBlur = 16;
      ctx.lineWidth = 2.5; ctx.strokeStyle = '#ff5a73'; ctx.stroke();
      ctx.shadowBlur = 0;
      shield(cx, cy, S * 0.8); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,150,165,0.6)'; ctx.stroke();
      var sheen = ctx.createLinearGradient(cx - S, cy - S, cx, cy);
      sheen.addColorStop(0, 'rgba(255,255,255,0.22)'); sheen.addColorStop(1, 'rgba(255,255,255,0)');
      shield(cx, cy, S * 0.8); ctx.fillStyle = sheen; ctx.fill();
      var lw = S * 0.62, lh = S * 0.48, lx = cx - lw / 2, ly = cy - S * 0.08;
      ctx.shadowColor = 'rgba(255,90,110,1)'; ctx.shadowBlur = 14;
      ctx.lineWidth = S * 0.1; ctx.strokeStyle = '#ffd5db';
      ctx.beginPath(); ctx.arc(cx, ly, lw * 0.32, Math.PI, 0); ctx.stroke();
      var lg = ctx.createLinearGradient(0, ly, 0, ly + lh);
      lg.addColorStop(0, '#ffe5ea'); lg.addColorStop(1, '#ff6b81');
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.moveTo(lx + 4, ly); ctx.lineTo(lx + lw - 4, ly); ctx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + 4); ctx.lineTo(lx + lw, ly + lh - 4); ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - 4, ly + lh); ctx.lineTo(lx + 4, ly + lh); ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - 4); ctx.lineTo(lx, ly + 4); ctx.quadraticCurveTo(lx, ly, lx + 4, ly); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#5a0d1a'; ctx.beginPath(); ctx.arc(cx, ly + lh * 0.42, S * 0.07, 0, TAU); ctx.fill(); ctx.fillRect(cx - S * 0.03, ly + lh * 0.42, S * 0.06, lh * 0.32);
      ctx = saved;
      return { c: c, half: half, S: S };
    }
    function shield(cx, cy, S) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - S);
      ctx.bezierCurveTo(cx + S * 0.45, cy - S * 0.78, cx + S * 0.78, cy - S * 0.78, cx + S * 0.82, cy - S * 0.72);
      ctx.bezierCurveTo(cx + S * 0.86, cy + S * 0.05, cx + S * 0.55, cy + S * 0.7, cx, cy + S);
      ctx.bezierCurveTo(cx - S * 0.55, cy + S * 0.7, cx - S * 0.86, cy + S * 0.05, cx - S * 0.82, cy - S * 0.72);
      ctx.bezierCurveTo(cx - S * 0.78, cy - S * 0.78, cx - S * 0.45, cy - S * 0.78, cx, cy - S);
      ctx.closePath();
    }
    return {
      resize: function (s) { W = s.w; H = s.h; dpr = s.dpr; shieldImg = null; },
      frame: function (t) {
        var cx = W * 0.5, cy = H * 0.46, sc = Math.min(W * 0.42, H * 0.5);
        var cam = BK.camera(t * 0.18 + env.px * 0.4, 0.2 + env.py * 0.15, 4, sc, cx, cy);
        for (var i = 0; i < N; i++) cam(nodes[i].p, proj[i]);
        ctx.globalCompositeOperation = 'lighter';
        for (var b = 0; b < 3; b++) {
          ctx.strokeStyle = 'rgba(255,50,70,' + (0.08 + b * 0.09).toFixed(2) + ')'; ctx.lineWidth = 0.7 + b * 0.2; ctx.beginPath();
          for (var e = 0; e < edges.length; e++) {
            var P = proj[edges[e][0]], Q = proj[edges[e][1]], zz = (P.z + Q.z) / 2;
            if ((zz < -0.4 ? 0 : zz < 0.4 ? 1 : 2) !== b) continue;
            ctx.moveTo(P.x, P.y); ctx.lineTo(Q.x, Q.y);
          }
          ctx.stroke();
        }
        for (i = 0; i < N; i++) {
          var n = nodes[i], p = proj[i], dz = (p.z + 1.2) / 2.4;
          var sz = n.flag ? (18 + 10 * Math.sin(t * 3 + n.ph)) * p.k : (5 + dz * 7) * p.k;
          ctx.globalAlpha = n.flag ? 0.95 : 0.3 + dz * 0.6;
          ctx.drawImage(n.flag ? sH : sR, p.x - sz / 2, p.y - sz / 2, sz, sz);
        }
        ctx.globalAlpha = 1;
        /* shield, pre-rendered once per resize */
        var S = Math.min(W, H) * 0.22, pulse = 0.5 + 0.5 * Math.sin(t * 2);
        var halo = ctx.createRadialGradient(cx, cy, S * 0.2, cx, cy, S * 1.9);
        halo.addColorStop(0, 'rgba(255,40,70,' + (0.35 + pulse * 0.2).toFixed(2) + ')'); halo.addColorStop(1, 'rgba(255,40,70,0)');
        ctx.fillStyle = halo; ctx.fillRect(cx - S * 2, cy - S * 2, S * 4, S * 4);
        ctx.globalCompositeOperation = 'source-over';
        if (!shieldImg || shieldImg.S !== S) shieldImg = renderShield(S, dpr);
        ctx.drawImage(shieldImg.c, cx - shieldImg.half, cy - shieldImg.half, shieldImg.half * 2, shieldImg.half * 2);
        /* scanning ring */
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(255,90,110,0.5)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(cx, cy + S * 0.15, S * 1.45, S * 0.36, 0, t % TAU, (t % TAU) + Math.PI * 1.2); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  };

  /* ---------------- Forecast: bars, demand line, forecast fan ---------------- */
  BK.scenes.forecast = function (ctx, env) {
    var R = BK.rng(101), NB = 18, FC = 5, vals = [];
    for (var i = 0; i < NB; i++) vals.push(0.22 + i / NB * 0.62 + (R() - 0.5) * 0.12 + (i % 4 === 2 ? 0.08 : 0));
    var inv = vals.map(function (v, i) { return v * 0.78 + Math.sin(i * 0.9) * 0.05; });
    var W, H, sC = BK.sprite('90,210,255', 24), sG = BK.sprite('255,180,70', 28), sW = BK.sprite('210,240,255', 36);
    var A = {}, B = {};
    function box(cam, x, h, d, w, front, side, top) {
      var v = [[x, 0, d], [x + w, 0, d], [x + w, h, d], [x, h, d], [x, 0, -d], [x + w, 0, -d], [x + w, h, -d], [x, h, -d]].map(function (p) { return cam(p, {}); });
      function face(ids, fill) { ctx.fillStyle = fill; ctx.beginPath(); ids.forEach(function (k, j) { if (j) ctx.lineTo(v[k].x, v[k].y); else ctx.moveTo(v[k].x, v[k].y); }); ctx.closePath(); ctx.fill(); }
      face([1, 5, 6, 2], side); face([0, 1, 2, 3], front); face([3, 2, 6, 7], top);
      return v;
    }
    return {
      resize: function (s) { W = s.w; H = s.h; },
      frame: function (t) {
        var sc = Math.min(W * 0.24, H * 0.5);
        var cam = BK.camera(-0.38 + Math.sin(t * 0.25) * 0.08 + env.px * 0.15, 0.32 + env.py * 0.06, 5, sc, W * 0.4, H * 0.82);
        var x0 = -1.65, step = 3.3 / NB, w = step * 0.62;
        /* floor grid */
        ctx.strokeStyle = 'rgba(80,150,255,0.16)'; ctx.lineWidth = 1; ctx.beginPath();
        for (var g = 0; g <= 8; g++) { cam([x0 - 0.1, 0, -0.5 + g * 0.18], A); cam([1.75, 0, -0.5 + g * 0.18], B); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); }
        for (g = 0; g <= 12; g++) { var gx = x0 - 0.1 + g * 0.285; cam([gx, 0, -0.5], A); cam([gx, 0, 0.94], B); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); }
        ctx.stroke();
        /* bars */
        var tops = [];
        for (var i = 0; i < NB; i++) {
          var fc = i >= NB - FC;
          var h = vals[i] * 1.25 * (fc ? 0.97 + 0.03 * Math.sin(t * 2 + i) : 1);
          var x = x0 + i * step;
          var v = box(cam, x, h, 0.07, w,
            fc ? 'rgba(255,170,60,0.28)' : 'rgba(40,130,255,0.78)',
            fc ? 'rgba(160,90,20,0.3)' : 'rgba(20,60,170,0.85)',
            fc ? 'rgba(255,210,140,0.5)' : 'rgba(150,220,255,0.9)');
          tops.push({ x: (v[3].x + v[2].x) / 2, y: (v[3].y + v[2].y) / 2 - 10, fc: fc });
          if (fc) {
            ctx.strokeStyle = 'rgba(255,180,70,0.8)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
            ctx.beginPath(); [0, 1, 2, 3].forEach(function (k, j) { if (j) ctx.lineTo(v[k].x, v[k].y); else ctx.moveTo(v[k].x, v[k].y); }); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
          }
        }
        /* inventory line */
        ctx.strokeStyle = 'rgba(47,123,255,0.9)'; ctx.lineWidth = 1.5; ctx.beginPath();
        for (i = 0; i < NB; i++) { cam([x0 + i * step + w / 2, inv[i] * 1.25, 0.07], A); if (i) ctx.lineTo(A.x, A.y); else ctx.moveTo(A.x, A.y); }
        ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        /* forecast fan */
        var hist = NB - FC - 1;
        ctx.fillStyle = 'rgba(255,180,70,0.14)'; ctx.beginPath();
        ctx.moveTo(tops[hist].x, tops[hist].y);
        for (i = hist + 1; i < NB; i++) ctx.lineTo(tops[i].x, tops[i].y - (i - hist) * 7);
        for (i = NB - 1; i > hist; i--) ctx.lineTo(tops[i].x, tops[i].y + (i - hist) * 6);
        ctx.closePath(); ctx.fill();
        /* demand line */
        var dl = new Path2D();
        for (i = 0; i <= hist; i++) { if (i) dl.lineTo(tops[i].x, tops[i].y); else dl.moveTo(tops[i].x, tops[i].y); }
        ctx.strokeStyle = 'rgba(90,210,255,0.25)'; ctx.lineWidth = 7; ctx.stroke(dl);
        ctx.strokeStyle = 'rgba(120,220,255,0.95)'; ctx.lineWidth = 2.2; ctx.stroke(dl);
        ctx.strokeStyle = 'rgba(255,190,90,0.95)'; ctx.setLineDash([5, 4]); ctx.beginPath();
        ctx.moveTo(tops[hist].x, tops[hist].y);
        for (i = hist + 1; i < NB; i++) ctx.lineTo(tops[i].x, tops[i].y);
        ctx.stroke(); ctx.setLineDash([]);
        for (i = 0; i < NB; i++) {
          var tp = tops[i];
          ctx.drawImage(tp.fc ? sG : sC, tp.x - 7, tp.y - 7, 14, 14);
        }
        var f = (t * 0.18) % 1, idx = Math.min(NB - 2, (f * (NB - 1)) | 0), fr = f * (NB - 1) - idx;
        ctx.drawImage(sW, tops[idx].x + (tops[idx + 1].x - tops[idx].x) * fr - 12, tops[idx].y + (tops[idx + 1].y - tops[idx].y) * fr - 12, 24, 24);
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  };
})();
