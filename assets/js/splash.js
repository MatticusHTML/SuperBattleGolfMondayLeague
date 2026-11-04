/* ============================================================
   Opening splash: hellfire climbing the screen behind the horror devil.
   index.html decides whether it plays (it adds `splash-on` to <html>),
   this file only runs the fire and the exit. No stats here.
   Add ?splash to the address to replay it, ?splash=hold to keep it up.
   ============================================================ */
(function () {
  'use strict';

  var html = document.documentElement;
  if (!html.classList.contains('splash-on')) return;

  var root = document.getElementById('splash');
  var canvas = document.getElementById('splash-fire');
  if (!root || !canvas || !canvas.getContext) { html.classList.remove('splash-on'); return; }

  var HOLD = /[?&]splash=hold\b/.test(location.search);
  var cfgSecs = parseFloat((window.SBG_CONFIG || {}).splashSeconds);
  var SHOW_MS = (cfgSecs > 0 ? cfgSecs : 100) * 1000;   // fire and face run this long (splashSeconds in index.html), then the whole splash fades out
  var FADE_MS = 600;
  var STAGES = 24;      // flame color steps, white-hot to dark red
  var RAMP = [[0, 255, 178, 66], [0.2, 255, 128, 28], [0.5, 238, 74, 12], [0.78, 172, 24, 8], [1, 70, 8, 4]];

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, unit = 1;
  var parts = [], sprites = [];
  var raf = 0, start = 0, last = 0, flameDebt = 0, emberDebt = 0;
  var leaving = false, done = false;

  function size() {
    // render at half resolution: fire is soft anyway and this keeps phones smooth
    W = Math.min(960, Math.max(160, Math.round(window.innerWidth * 0.5)));
    H = Math.min(700, Math.max(160, Math.round(window.innerHeight * 0.5)));
    canvas.width = W;
    canvas.height = H;
    unit = Math.max(0.6, W / 640);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function rampColor(t) {
    for (var i = 1; i < RAMP.length; i++) {
      if (t <= RAMP[i][0]) {
        var a = RAMP[i - 1], b = RAMP[i], k = (t - a[0]) / (b[0] - a[0]);
        return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
      }
    }
    return [RAMP[RAMP.length - 1][1], RAMP[RAMP.length - 1][2], RAMP[RAMP.length - 1][3]];
  }

  function buildSprites() {
    for (var s = 0; s < STAGES; s++) {
      var c = rampColor(s / (STAGES - 1)).map(Math.round);
      var sp = document.createElement('canvas');
      sp.width = sp.height = 64;
      var g = sp.getContext('2d');
      var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      var rgb = c[0] + ',' + c[1] + ',' + c[2];
      grad.addColorStop(0, 'rgba(' + rgb + ',1)');
      grad.addColorStop(0.45, 'rgba(' + rgb + ',0.55)');
      grad.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      sprites.push(sp);
    }
  }

  function spawnFlame(ramp) {
    var x = Math.random() * W;
    var center = 1 - Math.abs(x / W - 0.5) * 0.7;            // flames stand tallest in the middle
    var life = 0.9 + Math.random() * 0.8;
    parts.push({
      x0: x, y0: H + 16, ember: false, age: 0, life: life,
      rise: H * (1.1 + 0.9 * ramp) * center * (0.7 + Math.random() * 0.6),
      size: (42 + Math.random() * 60) * unit,
      sway: 6 + Math.random() * 22, ph: Math.random() * 6.283
    });
  }

  function spawnEmber() {
    parts.push({
      x0: Math.random() * W, y0: H + 6, ember: true, age: 0, life: 1 + Math.random(),
      rise: H * (0.6 + Math.random() * 0.5),
      size: (3 + Math.random() * 4) * unit,
      sway: 20 + Math.random() * 40, ph: Math.random() * 6.283
    });
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!start) { start = now; last = now; }
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var t = now - start;

    if (!leaving && !HOLD && t >= SHOW_MS) leave(false);

    var ramp = Math.min(1, t / 800);
    ramp = ramp * ramp * (3 - 2 * ramp);                      // flames climb the screen over the first second

    if (!leaving) {
      flameDebt += dt * W * 2.2 * (0.3 + 0.7 * ramp);
      var n = flameDebt | 0;
      flameDebt -= n;
      while (n-- > 0) spawnFlame(ramp);
      emberDebt += dt * W * 0.45 * ramp;
      var e = emberDebt | 0;
      emberDebt -= e;
      while (e-- > 0) spawnEmber();
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.age += dt;
      if (p.age >= p.life) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
      var k = p.age / p.life;
      var y = p.y0 - p.rise * (1 - (1 - k) * (1 - k));         // fast at first, slowing as it cools
      var x = p.x0 + Math.sin(p.age * 5 + p.ph) * p.sway * (0.3 + k);
      var s = p.size * (p.ember ? 1 - k * 0.4 : 1 - k * 0.5);
      var stage = p.ember ? Math.min(STAGES - 1, (k * 8) | 0) : Math.min(STAGES - 1, (Math.pow(k, 1.5) * STAGES) | 0);
      var h = p.ember ? s : s * 1.8;                           // flames are stretched into tongues, embers stay round
      ctx.globalAlpha = p.ember ? 1 - k : Math.pow(1 - k, 0.6) * 0.24;
      ctx.drawImage(sprites[stage], x - s / 2, y - h / 2, s, h);
    }
    ctx.globalAlpha = 1;
  }

  function end() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', size);
    document.removeEventListener('keydown', onKey);
    html.classList.remove('splash-on');
    if (root.parentNode) root.parentNode.removeChild(root);
  }

  function leave(fast) {
    if (leaving) { if (fast) { root.style.transitionDuration = '.2s'; setTimeout(end, 240); } return; }
    leaving = true;
    root.classList.add('is-leaving');
    if (fast) root.style.transitionDuration = '.25s';
    setTimeout(end, fast ? 280 : FADE_MS + 40);
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') leave(true);
  }

  buildSprites();
  size();
  window.addEventListener('resize', size);
  document.addEventListener('keydown', onKey);
  root.addEventListener('click', function () { leave(true); });

  if (!HOLD) {
    // safety net: if the tab was hidden and animation frames stopped, still clear the splash
    setTimeout(function () { leave(false); }, SHOW_MS + 1500);
    setTimeout(end, SHOW_MS + FADE_MS + 2500);
  }

  raf = requestAnimationFrame(frame);
})();
