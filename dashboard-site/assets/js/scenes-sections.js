/* Section scenes.
   sparks  a light overlay for the rendered artwork: drifting glints and a
           slow glow pulse at the image's focal point (data-focus="x,y") */
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

})();
