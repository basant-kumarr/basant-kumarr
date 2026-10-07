/* Sales forecasting chart: perspective bar series, a demand line and a
   forecast fan, drawn live on a 2D canvas. The values are decorative, not
   project results. */
(function () {
  'use strict';
  var BK = window.BK, TAU = BK.TAU;


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
