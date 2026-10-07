/* Section scenes: About ring, Skills orbit, Experience city, Education path,
   Contact globe. Static parts (skylines, buildings, roads) are painted once
   per resize into an offscreen layer; only light, particles and rotation are
   drawn per frame. */
(function () {
  'use strict';
  var BK = window.BK, TAU = BK.TAU;

  function layer(w, h, dpr) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    var g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c: c, g: g };
  }

  function tiltedRing(radius, tiltX, tiltZ) {
    var cz = Math.cos(tiltZ), sz = Math.sin(tiltZ), cx = Math.cos(tiltX), sx = Math.sin(tiltX);
    return function (a) {
      var x = Math.cos(a) * radius, z = Math.sin(a) * radius;
      var y1 = -z * sx, z1 = z * cx;
      return [x * cz - y1 * sz, x * sz + y1 * cz, z1];
    };
  }

  /* ---------------- About: portrait ring ---------------- */
  BK.scenes.ring = function (ctx, env) {
    var R = BK.rng(21), W, H, cx, cy, dr;
    var halo = [], nodes = [];
    for (var i = 0; i < (env.small ? 160 : 320); i++) halo.push({ a: R() * TAU, r: 1.12 + R() * 0.75, y: (R() - 0.5) * 0.35, s: 0.1 + R() * 0.35, b: R() });
    for (i = 0; i < 46; i++) { var a = R() * TAU; nodes.push({ a: a, r: 1.75 + R() * 1.1, d: R() * TAU }); }
    var rings = [
      { f: tiltedRing(1.22, 1.15, 0.2), rgb: '90,200,255', sp: 0.35 },
      { f: tiltedRing(1.42, 1.3, -0.5), rgb: '255,180,80', sp: -0.25 },
      { f: tiltedRing(1.62, 1.05, 0.85), rgb: '120,170,255', sp: 0.18 }
    ];
    var sC = BK.sprite('90,200,255', 24), sG = BK.sprite('255,180,80', 24), tmp = {};

    return {
      resize: function (s) { W = s.w; H = s.h; cx = W / 2; cy = H / 2; dr = Math.min(W, H) * 0.235; },
      frame: function (t) {
        ctx.globalCompositeOperation = 'lighter';
        var cam = BK.camera(t * 0.25 + env.px * 0.4, 0.2 + env.py * 0.2, 5, dr, cx, cy);
        /* network around */
        var np = nodes.map(function (n) {
          var ang = n.a + t * 0.03;
          return { x: cx + Math.cos(ang) * n.r * dr, y: cy + Math.sin(ang) * n.r * dr * 0.92, d: n.d };
        });
        ctx.strokeStyle = 'rgba(80,160,255,0.16)'; ctx.lineWidth = 0.7; ctx.beginPath();
        for (var i = 0; i < np.length; i++) for (var j = i + 1; j < np.length; j++) {
          var dx = np[i].x - np[j].x, dy = np[i].y - np[j].y;
          if (dx * dx + dy * dy < dr * dr * 0.55) { ctx.moveTo(np[i].x, np[i].y); ctx.lineTo(np[j].x, np[j].y); }
        }
        ctx.stroke();
        for (i = 0; i < np.length; i++) {
          ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 1.5 + np[i].d);
          ctx.drawImage(sC, np[i].x - 6, np[i].y - 6, 12, 12);
        }
        ctx.globalAlpha = 1;
        /* tilted rings with sweeping highlights */
        rings.forEach(function (rg, k) {
          var rc = BK.camera(t * rg.sp, 0.1, 5, dr, cx, cy);
          for (var q = 0; q < 160; q++) {
            var ang = q / 160 * TAU;
            rc(rg.f(ang), tmp);
            var sweep = Math.pow(0.5 + 0.5 * Math.cos(ang - t * (1 + k * 0.4)), 6);
            var al = (tmp.z > 0 ? 0.35 : 0.12) + sweep * 0.8;
            ctx.fillStyle = 'rgba(' + rg.rgb + ',' + al.toFixed(3) + ')';
            var s = 1 + sweep * 2;
            ctx.fillRect(tmp.x - s / 2, tmp.y - s / 2, s, s);
            if (sweep > 0.85 && q % 3 === 0) ctx.drawImage(k === 1 ? sG : sC, tmp.x - 8, tmp.y - 8, 16, 16);
          }
        });
        /* orbiting halo */
        for (i = 0; i < halo.length; i++) {
          var h = halo[i], an = h.a + t * h.s;
          cam([Math.cos(an) * h.r, h.y, Math.sin(an) * h.r], tmp);
          ctx.fillStyle = 'rgba(150,215,255,' + ((tmp.z > 0 ? 0.5 : 0.18) * (0.4 + h.b * 0.6)).toFixed(3) + ')';
          var sz = 0.8 + h.b * 1.4 * tmp.k;
          ctx.fillRect(tmp.x, tmp.y, sz, sz);
        }
        /* rim glow */
        var g = ctx.createRadialGradient(cx, cy, dr * 0.95, cx, cy, dr * 1.5);
        g.addColorStop(0, 'rgba(60,170,255,0.35)'); g.addColorStop(1, 'rgba(60,170,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, dr * 1.5, 0, TAU); ctx.arc(cx, cy, dr * 0.95, 0, TAU, true); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  };

  /* ---------------- Skills: orbit hub ---------------- */
  BK.scenes.skills = function (ctx, env, canvas) {
    var R = BK.rng(31), W, H, cx, cy, r0, chips = [], anchors = [];
    var sphere = BK.fibonacciSphere(env.small ? 260 : 520);
    var rings = [
      { f: tiltedRing(1.9, 0.5, 0.14), rgb: '255,176,64', sp: 0.3, n: 40 },
      { f: tiltedRing(2.9, 0.38, -0.1), rgb: '80,200,255', sp: -0.2, n: 56 },
      { f: tiltedRing(3.9, 0.3, 0.05), rgb: '255,150,60', sp: 0.12, n: 70 }
    ];
    rings.forEach(function (rg) { rg.p = []; for (var i = 0; i < rg.n; i++) rg.p.push({ a: R() * TAU, s: 0.5 + R(), b: R() }); });
    var dust = []; for (var i = 0; i < (env.small ? 80 : 180); i++) dust.push({ x: R(), y: R(), z: R() });
    var sC = BK.sprite('80,200,255', 32), sG = BK.sprite('255,176,64', 32), sW = BK.sprite('180,230,255', 48), tmp = {};
    chips = Array.prototype.slice.call(canvas.parentElement.querySelectorAll('[data-chip]'));

    return {
      resize: function (s) {
        W = s.w; H = s.h; cx = W / 2; cy = H * (env.small ? 0.46 : 0.48);
        r0 = Math.min(W * 0.075, H * 0.17);
        if (env.small || W < 600) r0 = Math.min(W * 0.14, H * 0.2);
        anchors = chips.filter(function (c) { return getComputedStyle(c).position === 'absolute'; })
          .map(function (c) { return BK.anchorOf(c, canvas); });
      },
      frame: function (t, dt) {
        ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < dust.length; i++) {
          var d = dust[i];
          ctx.fillStyle = 'rgba(140,190,255,' + (0.1 + d.z * 0.35).toFixed(2) + ')';
          ctx.fillRect(d.x * W, d.y * H, 1 + d.z, 1 + d.z);
        }
        var ringCam = BK.camera(0, 0.02 + env.py * 0.08, 6, r0, cx, cy);
        /* rings */
        rings.forEach(function (rg) {
          ctx.strokeStyle = 'rgba(' + rg.rgb + ',0.28)'; ctx.lineWidth = 1.2; ctx.beginPath();
          for (var q = 0; q <= 140; q++) { ringCam(rg.f(q / 140 * TAU), tmp); if (q) ctx.lineTo(tmp.x, tmp.y); else ctx.moveTo(tmp.x, tmp.y); }
          ctx.stroke();
          for (q = 0; q < rg.p.length; q++) {
            var p = rg.p[q]; p.a += rg.sp * p.s * dt;
            ringCam(rg.f(p.a), tmp);
            ctx.globalAlpha = (tmp.z > 0 ? 0.9 : 0.35) * (0.4 + p.b * 0.6);
            var s = (6 + p.b * 10) * tmp.k;
            ctx.drawImage(rg.rgb[0] === '8' ? sC : sG, tmp.x - s / 2, tmp.y - s / 2, s, s);
          }
          ctx.globalAlpha = 1;
        });
        /* lines to chips with travelling pulses */
        for (i = 0; i < anchors.length; i++) {
          var A = anchors[i];
          var gr = ctx.createLinearGradient(cx, cy, A.x, A.y);
          gr.addColorStop(0, 'rgba(90,200,255,0.5)'); gr.addColorStop(1, 'rgba(90,200,255,0.08)');
          ctx.strokeStyle = gr; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(A.x, A.y); ctx.stroke();
          var f = ((t * 0.35 + i * 0.137) % 1);
          ctx.globalAlpha = Math.sin(f * Math.PI);
          ctx.drawImage(sW, cx + (A.x - cx) * f - 8, cy + (A.y - cy) * f - 8, 16, 16);
          ctx.globalAlpha = 1;
        }
        /* core sphere: glow, wireframe dots, hot centre */
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r0 * 2.2);
        g.addColorStop(0, 'rgba(120,220,255,0.75)'); g.addColorStop(0.35, 'rgba(40,140,255,0.35)'); g.addColorStop(1, 'rgba(20,60,200,0)');
        ctx.fillStyle = g; ctx.fillRect(cx - r0 * 2.3, cy - r0 * 2.3, r0 * 4.6, r0 * 4.6);
        var sc = BK.camera(t * 0.4, 0.35, 5, r0, cx, cy);
        ctx.fillStyle = 'rgba(170,230,255,0.7)'; ctx.beginPath();
        for (i = 0; i < sphere.length; i++) { sc(sphere[i], tmp); if (tmp.z > -0.2) ctx.rect(tmp.x, tmp.y, 1.3, 1.3); }
        ctx.fill();
        ctx.strokeStyle = 'rgba(150,220,255,0.5)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, r0 * 1.02, 0, TAU); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  };

  /* ---------------- Experience: night city ---------------- */
  BK.scenes.city = function (ctx, env) {
    var W, H, L, vx, hy, trails = [], motes = [];
    var R0 = BK.rng(41);
    for (var i = 0; i < 26; i++) trails.push({ lane: (i % 4) - 1.5, t: R0(), v: 0.08 + R0() * 0.12, red: i % 2 === 0 });
    for (i = 0; i < 70; i++) motes.push({ x: R0(), y: R0(), s: R0(), p: R0() * TAU });

    function paint(s) {
      var R = BK.rng(43);
      L = layer(W, H, s.dpr); var g = L.g;
      vx = W * (W < 700 ? 0.5 : 0.72); hy = H * 0.56;
      var sky = g.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0, '#020713'); sky.addColorStop(0.6, '#06173a'); sky.addColorStop(1, '#0d3a72');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      for (i = 0; i < 160; i++) { g.fillStyle = 'rgba(200,225,255,' + (R() * 0.6).toFixed(2) + ')'; g.fillRect(R() * W, R() * hy * 0.7, 1.1, 1.1); }
      var haze = g.createRadialGradient(vx, hy, 0, vx, hy, W * 0.45);
      haze.addColorStop(0, 'rgba(90,170,255,0.55)'); haze.addColorStop(0.4, 'rgba(40,100,220,0.18)'); haze.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = haze; g.fillRect(0, 0, W, H);

      /* far skyline */
      function tower(x, w, h, base, tint, lit) {
        var top = base - h;
        var body = g.createLinearGradient(x, top, x + w, top);
        body.addColorStop(0, 'rgba(' + tint + ',1)'); body.addColorStop(1, 'rgba(4,10,28,1)');
        g.fillStyle = body; g.fillRect(x, top, w, h);
        g.fillStyle = 'rgba(120,200,255,0.55)'; g.fillRect(x, top, 1, h);
        /* setback crown and spire on the taller towers */
        if (h > H * 0.22) {
          g.fillStyle = 'rgba(' + tint + ',1)';
          g.fillRect(x + w * 0.2, top - h * 0.06, w * 0.6, h * 0.06);
          g.fillRect(x + w * 0.42, top - h * 0.14, w * 0.16, h * 0.08);
          g.fillStyle = 'rgba(160,220,255,0.7)'; g.fillRect(x + w * 0.5 - 0.5, top - h * 0.22, 1, h * 0.08);
        }
        var cw = Math.max(1.4, w / 16), ch = Math.max(1.4, cw * 1.3);
        for (var yy = top + 4; yy < base - 3; yy += ch * 2) {
          for (var xx = x + 2; xx < x + w - cw; xx += cw * 1.9) {
            if (R() > lit) continue;
            var warm = R() < 0.55;
            g.fillStyle = warm ? 'rgba(255,' + (190 + (R() * 40 | 0)) + ',120,' + (0.55 + R() * 0.45).toFixed(2) + ')' : 'rgba(140,210,255,' + (0.4 + R() * 0.5).toFixed(2) + ')';
            g.fillRect(xx, yy, cw, ch);
          }
        }
        if (h > H * 0.3) { g.fillStyle = 'rgba(255,80,80,0.9)'; g.fillRect(x + w / 2 - 1, top - h * 0.22 - 3, 2, 3); }
      }
      var x = W * 0.3;
      while (x < W) { var w = 14 + R() * 30; tower(x, w, H * (0.06 + R() * 0.2), hy, '14,32,70', 0.35); x += w + 2; }
      /* mid towers, taller near the vanishing point */
      x = W * 0.38;
      while (x < W + 40) {
        w = 24 + R() * 40;
        var near = 1 - Math.min(1, Math.abs(x + w / 2 - vx) / (W * 0.5));
        tower(x, w, H * (0.12 + near * 0.26 + R() * 0.1), hy + 8, '20,48,98', 0.45);
        x += w + 14 + R() * 34;
      }
      /* road */
      g.fillStyle = '#030914'; g.fillRect(0, hy, W, H - hy);
      var road = g.createLinearGradient(0, hy, 0, H);
      road.addColorStop(0, 'rgba(60,140,255,0.35)'); road.addColorStop(1, 'rgba(10,30,70,0.6)');
      g.fillStyle = road;
      g.beginPath(); g.moveTo(vx - 6, hy); g.lineTo(vx + 6, hy); g.lineTo(W * 1.25, H); g.lineTo(vx - W * 0.6, H); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,220,150,0.5)'; g.lineWidth = 1.2; g.setLineDash([10, 14]);
      g.beginPath(); g.moveTo(vx, hy); g.lineTo(vx + (W * 0.32), H); g.stroke(); g.setLineDash([]);
      /* reflections of the towers on the wet road */
      for (var rx = W * 0.4; rx < W; rx += 6 + R() * 14) {
        var refl = g.createLinearGradient(0, hy, 0, hy + (H - hy) * (0.3 + R() * 0.5));
        var warmR = R() < 0.5 ? '255,190,110' : '120,190,255';
        refl.addColorStop(0, 'rgba(' + warmR + ',' + (0.08 + R() * 0.16).toFixed(2) + ')'); refl.addColorStop(1, 'rgba(' + warmR + ',0)');
        g.fillStyle = refl; g.fillRect(rx, hy, 1.5 + R() * 2.5, H - hy);
      }

      /* the figure, from behind, rim-lit by the city */
      var fh = H * 0.3, fx = W < 700 ? W * 0.3 : W * 0.66, fy = H * 0.96;
      var u = fh / 100;
      g.save(); g.translate(fx, fy); g.scale(u, u);
      g.beginPath();
      g.moveTo(-9, 0); g.lineTo(-8, -46); g.lineTo(-12, -50); g.lineTo(-16, -62); g.lineTo(-15, -74);
      g.quadraticCurveTo(-14, -82, -6, -84); g.lineTo(-4, -86);
      g.arc(0, -91, 6.2, Math.PI * 0.7, Math.PI * 2.3);
      g.lineTo(6, -84); g.quadraticCurveTo(14, -82, 15, -74); g.lineTo(16, -62); g.lineTo(12, -50);
      g.lineTo(8, -46); g.lineTo(9, 0); g.lineTo(2, 0); g.lineTo(0, -40); g.lineTo(-2, 0); g.closePath();
      g.fillStyle = '#02050c'; g.fill();
      g.shadowColor = 'rgba(90,190,255,0.9)'; g.shadowBlur = 10;
      g.strokeStyle = 'rgba(120,210,255,0.55)'; g.lineWidth = 0.9; g.stroke();
      g.shadowBlur = 0;
      /* backpack */
      g.beginPath(); g.moveTo(-10, -78); g.quadraticCurveTo(0, -82, 10, -78); g.lineTo(11, -54); g.quadraticCurveTo(0, -50, -11, -54); g.closePath();
      g.fillStyle = '#060c1a'; g.fill(); g.strokeStyle = 'rgba(120,210,255,0.35)'; g.stroke();
      g.restore();
      var pool = g.createRadialGradient(fx, fy, 0, fx, fy, fh * 0.5);
      pool.addColorStop(0, 'rgba(90,180,255,0.25)'); pool.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = pool; g.fillRect(fx - fh, fy - fh * 0.3, fh * 2, fh * 0.4);
    }

    return {
      resize: function (s) { W = s.w; H = s.h; paint(s); },
      frame: function (t, dt) {
        ctx.drawImage(L.c, 0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        /* light trails converging on the vanishing point */
        for (var i = 0; i < trails.length; i++) {
          var tr = trails[i];
          tr.t = (tr.t + tr.v * dt * (tr.red ? 1 : -1) + 1) % 1;
          var spread = tr.lane * W * 0.13;
          for (var k = 0; k < 8; k++) {
            var f = Math.max(0, tr.t - k * 0.012);
            var e = f * f;
            var x = vx + (spread + W * 0.08) * e * 1.6, y = hy + (H - hy) * e;
            ctx.globalAlpha = (1 - k / 8) * (0.2 + e * 0.8);
            ctx.fillStyle = tr.red ? '#ff4d5e' : '#ffe0a0';
            var s = 1 + e * 3;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
          }
        }
        ctx.globalAlpha = 1;
        /* drifting data motes */
        for (i = 0; i < motes.length; i++) {
          var m = motes[i];
          var yy = ((m.y - t * 0.01 * (0.5 + m.s)) % 1 + 1) % 1;
          ctx.fillStyle = 'rgba(140,210,255,' + (0.2 + 0.4 * Math.abs(Math.sin(t + m.p))).toFixed(2) + ')';
          ctx.fillRect(m.x * W, yy * H * 0.9, 1.5, 1.5);
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  };

  /* ---------------- Education: path of light between two campuses ---------------- */
  BK.scenes.path = function (ctx, env) {
    var W, H, L, curves = [], flow = [];
    var R0 = BK.rng(51);
    for (var i = 0; i < (env.small ? 70 : 150); i++) flow.push({ c: i % 3, t: R0(), v: 0.04 + R0() * 0.06, s: R0() });

    function bez(c, t) {
      var u = 1 - t;
      return {
        x: u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6],
        y: u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7]
      };
    }

    function paint(s) {
      var R = BK.rng(53);
      L = layer(W, H, s.dpr); var g = L.g;
      var sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#020713'); sky.addColorStop(0.55, '#071a3f'); sky.addColorStop(1, '#030a1a');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      for (i = 0; i < 140; i++) { g.fillStyle = 'rgba(200,225,255,' + (R() * 0.6).toFixed(2) + ')'; g.fillRect(R() * W, R() * H * 0.6, 1.1, 1.1); }
      var gy = H * 0.72;
      /* left: classical hall with dome and columns */
      var bw = Math.min(W * 0.2, 260), bx = W * 0.01, bh = H * 0.32;
      g.fillStyle = '#0b1424'; g.fillRect(bx, gy - bh, bw, bh);
      g.beginPath(); g.moveTo(bx - 6, gy - bh); g.lineTo(bx + bw / 2, gy - bh - bh * 0.28); g.lineTo(bx + bw + 6, gy - bh); g.closePath(); g.fill();
      g.beginPath(); g.arc(bx + bw / 2, gy - bh - bh * 0.28, bw * 0.13, Math.PI, 0); g.fill();
      for (var c = 0; c < 8; c++) {
        var colx = bx + 8 + c * (bw - 16) / 7;
        var lit = g.createLinearGradient(colx, gy - bh, colx, gy);
        lit.addColorStop(0, 'rgba(255,200,130,0.85)'); lit.addColorStop(1, 'rgba(255,160,80,0.35)');
        g.fillStyle = lit; g.fillRect(colx - 2, gy - bh * 0.82, 4, bh * 0.8);
      }
      g.fillStyle = 'rgba(255,190,110,0.5)';
      for (c = 0; c < 7; c++) g.fillRect(bx + 14 + c * (bw - 28) / 6, gy - bh * 0.92, 6, 4);
      var warm = g.createRadialGradient(bx + bw / 2, gy, 0, bx + bw / 2, gy, bw);
      warm.addColorStop(0, 'rgba(255,170,80,0.35)'); warm.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = warm; g.fillRect(bx - bw * 0.5, gy - bw, bw * 2, bw * 1.4);
      /* right: modern glass campus */
      var mw = Math.min(W * 0.24, 320), mx = W - mw - W * 0.005, mh = H * 0.24;
      g.fillStyle = '#0a1426'; g.fillRect(mx, gy - mh, mw, mh);
      g.fillRect(mx + mw * 0.62, gy - mh * 1.7, mw * 0.22, mh * 1.7);
      for (var yy = gy - mh + 6; yy < gy - 6; yy += 10) for (var xx = mx + 6; xx < mx + mw - 8; xx += 12) {
        if (R() < 0.3) continue;
        g.fillStyle = R() < 0.6 ? 'rgba(255,205,140,0.8)' : 'rgba(140,210,255,0.6)'; g.fillRect(xx, yy, 7, 5);
      }
      for (yy = gy - mh * 1.7 + 6; yy < gy - mh; yy += 9) { g.fillStyle = 'rgba(255,205,140,' + (0.3 + R() * 0.5).toFixed(2) + ')'; g.fillRect(mx + mw * 0.64, yy, mw * 0.18, 4); }
      warm = g.createRadialGradient(mx + mw / 2, gy, 0, mx + mw / 2, gy, mw);
      warm.addColorStop(0, 'rgba(255,170,80,0.3)'); warm.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = warm; g.fillRect(mx - mw * 0.5, gy - mw, mw * 2, mw * 1.4);
      /* ground */
      var gr = g.createLinearGradient(0, gy, 0, H);
      gr.addColorStop(0, '#05112a'); gr.addColorStop(1, '#020611');
      g.fillStyle = gr; g.fillRect(0, gy, W, H - gy);

      /* the winding path and the arc of time above it */
      curves = [
        [W * 0.05, H * 0.98, W * 0.35, H * 0.62, W * 0.62, H * 1.02, W * 0.98, H * 0.66],
        [W * 0.08, H * 0.92, W * 0.38, H * 0.7, W * 0.6, H * 0.92, W * 0.96, H * 0.6],
        [W * 0.22, H * 0.16, W * 0.42, H * -0.02, W * 0.66, H * -0.02, W * 0.86, H * 0.16]
      ];
      [['rgba(70,180,255,', 10], ['rgba(70,180,255,', 3]].forEach(function (st, k) {
        g.strokeStyle = st[0] + (k ? 0.9 : 0.18) + ')'; g.lineWidth = st[1];
        [0, 1].forEach(function (ci) {
          var cc = curves[ci]; g.beginPath(); g.moveTo(cc[0], cc[1]); g.bezierCurveTo(cc[2], cc[3], cc[4], cc[5], cc[6], cc[7]); g.stroke();
        });
      });
      var cc = curves[2];
      g.strokeStyle = 'rgba(255,180,80,0.5)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(cc[0], cc[1]); g.bezierCurveTo(cc[2], cc[3], cc[4], cc[5], cc[6], cc[7]); g.stroke();
    }

    var sC = BK.sprite('90,200,255', 24), sG = BK.sprite('255,180,80', 24);
    return {
      resize: function (s) { W = s.w; H = s.h; paint(s); },
      frame: function (t, dt) {
        ctx.drawImage(L.c, 0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < flow.length; i++) {
          var f = flow[i];
          f.t = (f.t + f.v * dt) % 1;
          var p = bez(curves[f.c], f.t);
          var sz = (f.c === 2 ? 8 : 10) + f.s * 10;
          ctx.globalAlpha = Math.sin(f.t * Math.PI) * (0.5 + f.s * 0.5);
          ctx.drawImage(f.c === 2 ? sG : sC, p.x - sz / 2, p.y - sz / 2, sz, sz);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  };

  /* ---------------- Contact: data globe ---------------- */
  BK.scenes.globe = function (ctx, env) {
    var R = BK.rng(61), W, H, cx, cy, sc;
    function land(p) {
      /* smooth procedural continents */
      var v = Math.sin(p[0] * 3.1 + 1.3) * Math.cos(p[1] * 2.7) + Math.sin(p[2] * 3.7 + p[0] * 1.9) * 0.8 + Math.cos(p[1] * 5.3 + p[2] * 2.1) * 0.45;
      return v > 0.35;
    }
    var all = BK.fibonacciSphere(env.small ? 1400 : 3000);
    var landPts = all.filter(land), seaPts = all.filter(function (p, i) { return !land(p) && i % 2 === 0; });
    var hubs = []; for (var i = 0; i < 18; i++) hubs.push(landPts[(R() * landPts.length) | 0]);
    var arcs = []; for (i = 0; i < 14; i++) arcs.push({ a: hubs[(R() * hubs.length) | 0], b: hubs[(R() * hubs.length) | 0], t: R(), v: 0.15 + R() * 0.2 });
    function slerp(a, b, t, lift) {
      var x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, z = a[2] + (b[2] - a[2]) * t;
      var l = Math.sqrt(x * x + y * y + z * z) || 1, h = 1 + lift * Math.sin(Math.PI * t);
      return [x / l * h, y / l * h, z / l * h];
    }
    var sC = BK.sprite('90,200,255', 24), sG = BK.sprite('255,180,80', 32), tmp = {};
    return {
      resize: function (s) { W = s.w; H = s.h; cx = W * 0.46; cy = H * 0.5; sc = Math.min(W, H) * 0.3; },
      frame: function (t, dt) {
        var cam = BK.camera(t * 0.12 + env.px * 0.3, 0.35 + env.py * 0.1, 4, sc, cx, cy);
        ctx.globalCompositeOperation = 'lighter';
        var atm = ctx.createRadialGradient(cx, cy, sc * 0.9, cx, cy, sc * 1.35);
        atm.addColorStop(0, 'rgba(60,160,255,0.28)'); atm.addColorStop(1, 'rgba(60,160,255,0)');
        ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, sc * 1.35, 0, TAU); ctx.fill();
        var body = ctx.createRadialGradient(cx - sc * 0.3, cy - sc * 0.3, 0, cx, cy, sc);
        body.addColorStop(0, 'rgba(30,80,170,0.16)'); body.addColorStop(1, 'rgba(5,20,60,0.06)');
        ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, sc, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(70,140,255,0.4)'; ctx.beginPath();
        for (var i = 0; i < seaPts.length; i++) { cam(seaPts[i], tmp); if (tmp.z > 0) ctx.rect(tmp.x, tmp.y, 1.1, 1.1); }
        ctx.fill();
        ctx.fillStyle = 'rgba(140,215,255,0.85)'; ctx.beginPath();
        for (i = 0; i < landPts.length; i++) { cam(landPts[i], tmp); if (tmp.z > 0) { var s = 0.8 + tmp.z * 1.2; ctx.rect(tmp.x, tmp.y, s, s); } }
        ctx.fill();
        for (i = 0; i < arcs.length; i++) {
          var a = arcs[i]; a.t = (a.t + a.v * dt) % 1.4;
          ctx.strokeStyle = 'rgba(255,190,90,0.35)'; ctx.lineWidth = 1; ctx.beginPath();
          var vis = false;
          for (var k = 0; k <= 30; k++) {
            cam(slerp(a.a, a.b, k / 30, 0.25), tmp);
            if (tmp.z < -0.1) { vis = false; continue; }
            if (!vis) { ctx.moveTo(tmp.x, tmp.y); vis = true; } else ctx.lineTo(tmp.x, tmp.y);
          }
          ctx.stroke();
          if (a.t <= 1) {
            cam(slerp(a.a, a.b, a.t, 0.25), tmp);
            if (tmp.z > -0.1) ctx.drawImage(sG, tmp.x - 8, tmp.y - 8, 16, 16);
          }
        }
        for (i = 0; i < hubs.length; i++) { cam(hubs[i], tmp); if (tmp.z > 0) ctx.drawImage(sC, tmp.x - 7, tmp.y - 7, 14, 14); }
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  };
})();
