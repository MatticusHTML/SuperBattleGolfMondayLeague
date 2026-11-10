/* ============================================================
   Opening splash: a John Wick style VERSUS screen. Lasers and
   tracer fire run behind the two fighters (the laser scene from
   duel-fx.js); the slam-in, flash and VS mark are CSS.
   index.html decides whether it plays (it adds `splash-on` to <html>),
   this file only runs the lasers and the exit. No stats here.
   Add ?splash to the address to replay it, ?splash=hold to keep it up.
   ============================================================ */
(function () {
  'use strict';

  var html = document.documentElement;
  if (!html.classList.contains('splash-on')) return;

  var root = document.getElementById('splash');
  var canvas = document.getElementById('splash-fx');
  if (!root) { html.classList.remove('splash-on'); return; }

  var HOLD = /[?&]splash=hold\b/.test(location.search);
  var cfgSecs = parseFloat((window.SBG_CONFIG || {}).splashSeconds);
  var SHOW_MS = (cfgSecs > 0 ? cfgSecs : 5) * 1000;   // splashSeconds in index.html: how long it stays before fading out by itself
  var FADE_MS = 600;
  var leaving = false, done = false;
  var fx = null;

  // the laser scene is decoration: if it can't start, the splash still plays without it
  if (canvas && canvas.getContext && window.SBG_LASERS) {
    try {
      fx = window.SBG_LASERS.create(canvas, { intensity: 2.2 });
      fx.start();
    } catch (e) { fx = null; }
  }

  function end() {
    if (done) return;
    done = true;
    if (fx) fx.stop();
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

  document.addEventListener('keydown', onKey);
  root.addEventListener('click', function () { leave(true); });

  if (!HOLD) {
    setTimeout(function () { leave(false); }, SHOW_MS);
    // safety net: if the tab was hidden and timers were throttled, still clear the splash
    setTimeout(end, SHOW_MS + FADE_MS + 2500);
  }
})();
