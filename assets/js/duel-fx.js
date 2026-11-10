/* ============================================================
   Laser scene: sweeping lasers, tracer rounds that burst into
   sparks on impact, and drifting brass casings.
   SBG_LASERS.create(canvas, { intensity }) makes an independent
   scene. The Duel Winners theme background is one (SBG_DUEL,
   started and stopped by app.js), the opening splash is another.
   No stats here.
   ============================================================ */
(function () {
  'use strict';

  function create(canvas, opts) {
    var intensity = (opts && opts.intensity) || 1;   // 1 = background, higher = more gunfire
    var ctx = canvas.getContext('2d');

    var ORANGE = [255, 140, 40], BLUE = [70, 170, 255], WHITE = [236, 246, 255];
    var W = 0, H = 0, dpr = 1;
    var running = false, manual = false, raf = 0, last = 0, clock = 0;
    var beams = [], tracers = [], sparks = [], rings = [], casings = [], pending = [];
    var nextShot = 1, nextCasing = 0.8;
    var resizeTimer = 0;

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
    function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
    function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildBeams();
    }

    function buildBeams() {
      var n = W < 700 ? 4 : 7;
      var colors = [ORANGE, BLUE, WHITE, BLUE, ORANGE, WHITE, BLUE];
      beams = [];
      for (var i = 0; i < n; i++) {
        var side = i % 3 === 2;                                   // every third beam fires in from a side wall
        var fromLeft = i % 2 === 0;
        beams.push({
          x: side ? (fromLeft ? -40 : W + 40) : W * (i + 0.5) / n + rnd(-30, 30),
          y: side ? H * rnd(0.12, 0.6) : -40,
          base: side ? (fromLeft ? rnd(-0.15, 0.4) : Math.PI + rnd(-0.4, 0.15)) : Math.PI / 2 + rnd(-0.45, 0.45),
          amp: rnd(0.22, 0.55),
          speed: rnd(0.16, 0.5) * (Math.random() < 0.5 ? -1 : 1),
          phase: rnd(0, 6.28),
          color: colors[i % colors.length],
          width: rnd(1.1, 2)
        });
      }
    }

    function drawBeam(b, t, strength) {
      var ang = b.base + b.amp * Math.sin(t * b.speed + b.phase);
      var len = Math.hypot(W, H) * 1.35;
      var ex = b.x + Math.cos(ang) * len, ey = b.y + Math.sin(ang) * len;
      var f = 0.82 + 0.18 * Math.sin(t * 23 + b.phase * 3) * Math.sin(t * 7.1 + b.phase);
      if (Math.sin(t * 0.9 + b.phase * 5) > 0.985) f *= 1.7;       // an occasional strobe
      f *= strength;

      var g = ctx.createLinearGradient(b.x, b.y, ex, ey);
      g.addColorStop(0, rgba(b.color, 1));
      g.addColorStop(0.7, rgba(b.color, 0.7));
      g.addColorStop(1, rgba(b.color, 0));
      ctx.strokeStyle = g;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(ex, ey);

      ctx.globalAlpha = 0.13 * f; ctx.lineWidth = b.width * 20; ctx.stroke();
      ctx.globalAlpha = 0.32 * f; ctx.lineWidth = b.width * 6.5; ctx.stroke();
      ctx.globalAlpha = 0.9 * f;  ctx.lineWidth = b.width * 1.5;
      ctx.strokeStyle = rgba(WHITE, 1);
      ctx.stroke();
    }

    function shoot() {
      var fromLeft = Math.random() < 0.5;
      var x0 = fromLeft ? -40 : W + 40, y0 = rnd(H * 0.05, H * 0.95);
      var tx = rnd(W * 0.15, W * 0.85), ty = rnd(H * 0.1, H * 0.9);
      var impact = Math.random() < 0.6;
      var rounds = Math.random() < 0.35 ? Math.floor(rnd(3, 6)) : 1;   // sometimes a burst
      var glow = Math.random() < 0.5 ? ORANGE : BLUE;
      for (var i = 0; i < rounds; i++) {
        pending.push({
          at: clock + i * 0.07, x0: x0, y0: y0 + rnd(-6, 6), tx: tx + rnd(-10, 10), ty: ty + rnd(-10, 10),
          impact: impact, glow: glow
        });
      }
    }

    function launch(p) {
      var dx = p.tx - p.x0, dy = p.ty - p.y0, d = Math.hypot(dx, dy) || 1;
      tracers.push({
        x0: p.x0, y0: p.y0, ux: dx / d, uy: dy / d, s: 0,
        dist: p.impact ? d : d + Math.hypot(W, H),
        speed: rnd(2300, 3400), len: rnd(130, 260), glow: p.glow, impact: p.impact, hit: false
      });
    }

    function burst(x, y, glow) {
      var n = Math.floor(rnd(10, 17));
      for (var i = 0; i < n; i++) {
        var a = rnd(0, 6.283), sp = rnd(90, 420);
        sparks.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rnd(0.25, 0.6), age: 0,
          color: pick([ORANGE, WHITE, glow]) });
      }
      rings.push({ x: x, y: y, age: 0, life: 0.32, color: glow });
    }

    function spawnCasing() {
      casings.push({ x: rnd(0, W), y: -12, vx: rnd(-25, 25), vy: rnd(80, 170), rot: rnd(0, 6.28), spin: rnd(-6, 6),
        a: rnd(0.3, 0.6), s: rnd(5, 8) });
    }

    function drawTracer(tr) {
      var hs = Math.min(tr.s, tr.dist);
      var hx = tr.x0 + tr.ux * hs, hy = tr.y0 + tr.uy * hs;
      var ts = Math.max(0, hs - tr.len);
      var tx = tr.x0 + tr.ux * ts, ty = tr.y0 + tr.uy * ts;
      var g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, rgba(tr.glow, 0));
      g.addColorStop(1, rgba(WHITE, 1));
      ctx.lineCap = 'round';
      ctx.strokeStyle = rgba(tr.glow, 0.28);
      ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      if (tr.s < tr.dist) {
        var rg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14);
        rg.addColorStop(0, rgba(WHITE, 0.95));
        rg.addColorStop(1, rgba(tr.glow, 0));
        ctx.fillStyle = rg;
        ctx.fillRect(hx - 14, hy - 14, 28, 28);
      }
    }

    function render(dt, animate) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      var i, k;
      for (i = 0; i < beams.length; i++) drawBeam(beams[i], clock, animate ? 1 : 0.7);

      for (i = tracers.length - 1; i >= 0; i--) {
        var tr = tracers[i];
        tr.s += tr.speed * dt;
        if (tr.impact && !tr.hit && tr.s >= tr.dist) {
          tr.hit = true;
          burst(tr.x0 + tr.ux * tr.dist, tr.y0 + tr.uy * tr.dist, tr.glow);
        }
        if (tr.s - tr.len >= tr.dist) { tracers.splice(i, 1); continue; }
        drawTracer(tr);
      }

      for (i = sparks.length - 1; i >= 0; i--) {
        var sp = sparks[i];
        sp.age += dt;
        if (sp.age >= sp.life) { sparks.splice(i, 1); continue; }
        sp.vy += 420 * dt;
        sp.x += sp.vx * dt; sp.y += sp.vy * dt;
        k = 1 - sp.age / sp.life;
        ctx.globalAlpha = k;
        ctx.strokeStyle = rgba(sp.color, 1);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(sp.x - sp.vx * 0.03, sp.y - sp.vy * 0.03);
        ctx.stroke();
      }

      for (i = rings.length - 1; i >= 0; i--) {
        var rg = rings[i];
        rg.age += dt;
        if (rg.age >= rg.life) { rings.splice(i, 1); continue; }
        k = rg.age / rg.life;
        ctx.globalAlpha = (1 - k) * 0.7;
        ctx.strokeStyle = rgba(rg.color, 1);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, 6 + k * 46, 0, 6.283);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      for (i = casings.length - 1; i >= 0; i--) {
        var cs = casings[i];
        cs.x += cs.vx * dt; cs.y += cs.vy * dt; cs.rot += cs.spin * dt;
        if (cs.y > H + 20) { casings.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(cs.x, cs.y);
        ctx.rotate(cs.rot);
        ctx.globalAlpha = cs.a;
        ctx.fillStyle = '#e6be5a';
        ctx.fillRect(-cs.s / 2, -cs.s / 4, cs.s, cs.s / 2);
        ctx.fillStyle = '#9a7220';
        ctx.fillRect(cs.s / 2 - 1.5, -cs.s / 4, 1.5, cs.s / 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    function tick(dt) {
      dt = Math.max(0, Math.min(0.05, dt));
      clock += dt;
      nextShot -= dt;
      if (nextShot <= 0) { shoot(); nextShot = rnd(0.45, 1.5) / intensity; }
      nextCasing -= dt;
      if (nextCasing <= 0) { if (casings.length < 7) spawnCasing(); nextCasing = rnd(1.4, 3.2); }
      for (var i = pending.length - 1; i >= 0; i--) {
        if (pending[i].at <= clock) { launch(pending[i]); pending.splice(i, 1); }
      }
      render(dt, true);
    }

    function frame(now) {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      var dt = last ? (now - last) / 1000 : 0.016;
      last = now;
      tick(dt);
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { if (running) size(); }, 150);
    }

    function start(isManual) {
      if (running) return;
      running = true;
      manual = !!isManual;
      clock = 0; last = 0; nextShot = 0.6; nextCasing = 0.4;
      tracers = []; sparks = []; rings = []; casings = []; pending = [];
      size();
      window.addEventListener('resize', onResize);
      if (reduced()) {                                   // reduced motion: one calm still frame of beams
        clock = 2.2;
        render(0, false);
        return;
      }
      if (!manual) raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      ctx.clearRect(0, 0, W, H);
      tracers = []; sparks = []; rings = []; casings = []; pending = [];
    }

    return {
      start: start,
      stop: stop,
      // test hooks: start(true) then _tick(ms) steps the animation by hand
      _tick: function (ms) { if (running) tick(ms / 1000); },
      _state: function () { return { running: running, beams: beams.length, tracers: tracers.length, sparks: sparks.length, casings: casings.length }; }
    };
  }

  window.SBG_LASERS = { create: create };

  // the theme background scene: created on first use, because this script loads before the page's canvas exists
  var themeScene = null;
  function scene() {
    if (!themeScene) {
      var c = document.getElementById('duel-fx');
      themeScene = c && c.getContext ? create(c) : null;
    }
    return themeScene;
  }
  window.SBG_DUEL = {
    start: function (m) { var sc = scene(); if (sc) sc.start(m); },
    stop: function () { var sc = scene(); if (sc) sc.stop(); },
    _tick: function (ms) { var sc = scene(); if (sc) sc._tick(ms); },
    _state: function () { var sc = scene(); return sc ? sc._state() : null; }
  };
})();
