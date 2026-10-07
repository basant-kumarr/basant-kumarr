/* Section scenes.
   sparks  a light overlay for the rendered artwork: drifting glints and a
           slow glow pulse at the image's focal point (data-focus="x,y")
   globe   the contact section's rotating data globe */
(function () {
  'use strict';
  var BK = window.BK, TAU = BK.TAU;

  /* ---------------- Sparks over artwork ---------------- */
  BK.scenes.sparks = function (ctx, env, canvas) {
    var R = BK.rng(17), W, H, fx = 0.5, fy = 0.5;
    var f = (canvas.getAttribute('data-focus') || '').split(',').map(parseFloat);
    if (f.length === 2 && !isNaN(f[0])) { fx = f[0]; fy = f[1]; }
    var motes = [];
    for (var i = 0; i < (env.small ? 26 : 48); i++) motes.push({ x: R(), y: R(), v: 0.008 + R() * 0.02, s: R(), p: R() * TAU, gold: R() < 0.45 });
    var sC = BK.sprite('110,210,255', 24), sG = BK.sprite('255,190,90', 24);
    return {
      resize: function (s) { W = s.w; H = s.h; },
      frame: function (t) {
        ctx.globalCompositeOperation = 'lighter';
        var pulse = 0.5 + 0.5 * Math.sin(t * 1.3), r = Math.min(W, H) * 0.42;
        var g = ctx.createRadialGradient(W * fx, H * fy, 0, W * fx, H * fy, r);
        g.addColorStop(0, 'rgba(80,170,255,' + (0.06 + pulse * 0.08).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(80,170,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        for (var i = 0; i < motes.length; i++) {
          var m = motes[i];
          var y = ((m.y - t * m.v) % 1 + 1) % 1;
          var x = m.x + Math.sin(t * 0.4 + m.p) * 0.01;
          var a = Math.sin(y * Math.PI) * (0.35 + 0.65 * Math.abs(Math.sin(t * 1.7 + m.p)));
          var z = 6 + m.s * 12;
          ctx.globalAlpha = a;
          ctx.drawImage(m.gold ? sG : sC, x * W - z / 2, y * H - z / 2, z, z);
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
