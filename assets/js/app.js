/* ============================================================
   Super Battle Golf League - engine
   ------------------------------------------------------------
   Reads data from /data, derives every stat, renders the page.
   NOTHING is hard-coded here. To change the league, edit the
   JSON blocks in data/, never this file.

   Data sources:
     data/players.json            roster (slug, name, handle, color, avatar)
     data/seasons/S1/current.md   live season, full stats per match
     data/seasons/S0/current.md   archive season, winner only
     data/league/current.md       optional league-wide note

   Ball logic:
     gold   = 1st place in the most recent S1 match
     silver = 2nd place in the most recent S1 match
     bronze = 3rd place in the most recent S1 match
     green  = season points leader (highest total `score` summed
              across every S1 match). Change LEADER_METRIC below
              if you ever want a different rule.
   ============================================================ */

(function () {
  'use strict';

  var FILES = {
    players: 'data/players.json',
    s1: 'data/seasons/S1/current.md',
    s0: 'data/seasons/S0/current.md',
    team: 'data/seasons/TEAM/current.md',
    league: 'data/league/current.md'
  };

  var el = {
    updated: document.getElementById('updated'),
    error: document.getElementById('error'),
    pillFancy: document.getElementById('pill-fancy'),
    pillOptimized: document.getElementById('pill-optimized'),
    pillDemon: document.getElementById('pill-demon'),
    seasonSelect: document.getElementById('season-select'),
    viewS1: document.getElementById('view-s1'),
    viewS0: document.getElementById('view-s0'),
    viewTeam: document.getElementById('view-team'),
    footerNote: document.getElementById('footer-note'),
    sky: document.getElementById('sky-balls'),
    demonEmbers: document.getElementById('demon-embers'),
    mediaPlayer: document.getElementById('media-player'),
    mediaPlay: document.getElementById('media-play'),
    mediaSkip: document.getElementById('media-skip'),
    mediaList: document.getElementById('media-list'),
    mediaTracksWrap: document.querySelector('.drop-tracks'),
    mediaMenu: document.getElementById('media-menu'),
    mediaTrack: document.getElementById('media-track'),
    mediaVol: document.getElementById('media-vol'),
    mediaAudio: document.getElementById('media-audio')
  };

  var PLAYERS = {};
  var skyTimer = null;
  var glitchTimers = [];
  var emberTimer = null;
  var fadeRaf = null;
  var trackBusy = false;
  var DEMON_TRACK = { file: 'assets/audio/demon-time-soundtrack.mp3', label: 'Demon Time Mix' };
  var preDemonState = null;
  var FADE_MS = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2000;
  var MODE_KEY = 'sbg-display-mode';
  var VOL_KEY = 'sbg-volume';
  var TRACKS = [
    { file: 'assets/audio/01-main-menu.mp3', label: 'Main Menu' },
    { file: 'assets/audio/02-lobby.mp3', label: 'Lobby' },
    { file: 'assets/audio/03-forest.mp3', label: 'Forest' },
    { file: 'assets/audio/05-forest-hurry.mp3', label: 'Forest (Hurry!)' },
    { file: 'assets/audio/06-coastal.mp3', label: 'Coastal' },
    { file: 'assets/audio/07-coastal-hurry.mp3', label: 'Coastal (Hurry!)' },
    { file: 'assets/audio/08-desert.mp3', label: 'Desert' },
    { file: 'assets/audio/10-desert-hurry.mp3', label: 'Desert (Hurry!)' },
    { file: 'assets/audio/11-winter.mp3', label: 'Winter' },
    { file: 'assets/audio/13-winter-hurry.mp3', label: 'Winter (Hurry!)' },
    { file: 'assets/audio/14-attack-on-city.mp3', label: 'City' },
    { file: 'assets/audio/15-attack-on-city-hurry.mp3', label: 'City (Hurry!)' }
  ];
  var trackIdx = 0;
  var shuffleOrder = [];
  var shufflePos = 0;
  var musicOn = false;

  /* ---------- loading ---------- */
  function load(path) {
    return fetch(path, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error(path + ' -> ' + res.status);
      return res.text();
    }).then(function (text) {
      if (path.indexOf('.json') !== -1 && path.indexOf('.md') === -1) return JSON.parse(text);
      var block = text.match(/```json\s*([\s\S]*?)```/);
      if (!block) throw new Error('No ```json block found in ' + path);
      return JSON.parse(block[1]);
    });
  }

  /* ---------- small helpers ---------- */
  function num(v) { return typeof v === 'number' ? v : 0; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function p(slug) {
    return PLAYERS[slug] || { name: slug, handle: '', color: '#7a8a7f', avatar: null };
  }
  function firstInitial(name) { return (name || '?').trim().charAt(0).toUpperCase(); }
  function signed(n) { return (n > 0 ? '+' : '') + n; }

  function seasonStatChips(s) {
    return '<div class="season-stats">' +
      '<span class="chip" title="Total first place matches">1st Places <b>' + num(s.wins) + '</b></span>' +
      '<span class="chip chip-pts">Points <b>' + num(s.points) + '</b></span>' +
      '<span class="chip">Holes Won <b>' + num(s.holesWon) + '</b></span>' +
      '<span class="chip">Holes Finished <b>' + num(s.holesDone) + '</b></span>' +
      '<span class="chip">Par <b>' + signed(num(s.parDelta)) + '</b></span>' +
      '<span class="chip">KOs <b>' + num(s.knockouts) + '</b></span>' +
    '</div>';
  }

  function portrait(slug, cls, clickable, imageOverride) {
    var pl = p(slug);
    var c = cls || '';
    var img = imageOverride || pl.avatar;
    if (img && clickable !== false) {
      return '<button type="button" class="portrait portrait-btn ' + c + '"' +
        ' data-portrait="' + esc(img) + '"' +
        ' data-name="' + esc(pl.name) + '"' +
        ' aria-label="View full portrait of ' + esc(pl.name) + '"' +
        ' style="background-image:url(\'' + esc(img) + '\')"></button>';
    }
    if (img) {
      return '<div class="portrait ' + c + '" style="background-image:url(\'' +
        esc(img) + '\')"></div>';
    }
    return '<div class="portrait ' + c + '" style="--pc:' + esc(pl.color) + '">' +
      esc(firstInitial(pl.name)) + '</div>';
  }
  function ball(kind) {
    var labels = {
      gold: 'Gold ball',
      silver: 'Silver ball',
      bronze: 'Bronze ball',
      green: 'Green ball',
      ko: 'KO ball'
    };
    var label = labels[kind] || kind.charAt(0).toUpperCase() + kind.slice(1) + ' ball';
    return '<span class="ball ' + kind + '" role="img" aria-label="' + label + '" title="' + label + '"></span>';
  }

  function ballsHeld(slug, c, koLeader) {
    var balls = [];
    if (c.podium.gold === slug) balls.push('gold');
    if (c.podium.silver === slug) balls.push('silver');
    if (c.podium.bronze === slug) balls.push('bronze');
    if (c.green === slug) balls.push('green');
    if (koLeader && koLeader.slug === slug) balls.push('ko');
    return balls;
  }

  function ballCardClass(slug, c, koLeader) {
    var balls = ballsHeld(slug, c, koLeader);
    if (!balls.length) return '';
    return 'ball-card ' + balls.map(function (b) { return 'ball-' + b; }).join(' ');
  }

  function cardClasses(slug, c, koLeader) {
    return ballCardClass(slug, c, koLeader);
  }

  function getMode() {
    var c = document.documentElement.classList;
    if (c.contains('mode-demon')) return 'demon';
    return c.contains('mode-optimized') ? 'optimized' : 'fancy';
  }

  function setMode(mode) {
    if (mode !== 'optimized' && mode !== 'demon') mode = 'fancy';
    var wasDemon = getMode() === 'demon';
    document.documentElement.classList.toggle('mode-fancy', mode === 'fancy');
    document.documentElement.classList.toggle('mode-optimized', mode === 'optimized');
    document.documentElement.classList.toggle('mode-demon', mode === 'demon');
    el.pillFancy.setAttribute('aria-pressed', mode === 'fancy');
    el.pillOptimized.setAttribute('aria-pressed', mode === 'optimized');
    if (el.pillDemon) el.pillDemon.setAttribute('aria-pressed', mode === 'demon');
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) { /* ignore */ }
    refreshFx();
    if (mode === 'demon' && !wasDemon) enterDemonMode();
    else if (mode !== 'demon' && wasDemon) exitDemonMode();
  }

  function launchSkyBall() {
    if (!el.sky || getMode() !== 'fancy') return;
    var shot = document.createElement('div');
    var y = 8 + Math.random() * 72;
    var dur = 1 + Math.random() * 0.9;
    var tilt = -6 + Math.random() * 12;
    var bounce = Math.random() < 0.5;

    shot.className = 'sky-shot' + (bounce ? ' sky-shot--bounce' : '');
    shot.style.setProperty('--y', y + 'vh');
    shot.style.setProperty('--tilt', tilt + 'deg');
    shot.style.setProperty('--dur', dur + 's');

    if (bounce) {
      var edges = ['top', 'bottom', 'right'];
      var edge = edges[Math.floor(Math.random() * edges.length)];
      if (edge === 'bottom') {
        shot.style.setProperty('--hit-x', (32 + Math.random() * 42) + '%');
        shot.style.setProperty('--hit-y', '93vh');
        shot.style.setProperty('--end-x', '108%');
        shot.style.setProperty('--end-y', Math.max(8, y - 12 - Math.random() * 28) + 'vh');
        shot.style.setProperty('--tilt-end', (tilt - 8 - Math.random() * 14) + 'deg');
      } else if (edge === 'top') {
        shot.style.setProperty('--hit-x', (32 + Math.random() * 42) + '%');
        shot.style.setProperty('--hit-y', '4vh');
        shot.style.setProperty('--end-x', '108%');
        shot.style.setProperty('--end-y', Math.min(88, y + 12 + Math.random() * 28) + 'vh');
        shot.style.setProperty('--tilt-end', (tilt + 8 + Math.random() * 14) + 'deg');
      } else {
        shot.style.setProperty('--hit-x', '96%');
        shot.style.setProperty('--hit-y', Math.max(8, Math.min(88, y + (Math.random() - 0.5) * 36)) + 'vh');
        shot.style.setProperty('--end-x', (18 + Math.random() * 28) + '%');
        shot.style.setProperty('--end-y', Math.max(8, Math.min(88, y - 18 + Math.random() * 36)) + 'vh');
        shot.style.setProperty('--tilt-end', (tilt + 140 + Math.random() * 40) + 'deg');
      }
    }

    el.sky.appendChild(shot);
    shot.addEventListener('animationend', function () { shot.remove(); });
  }

  function stopSkyBalls() {
    if (skyTimer) { clearTimeout(skyTimer); skyTimer = null; }
    if (el.sky) el.sky.innerHTML = '';
  }

  function scheduleSkyBall() {
    stopSkyBalls();
    if (getMode() !== 'fancy') return;
    function next() {
      skyTimer = setTimeout(function () {
        launchSkyBall();
        next();
      }, 5000 + Math.random() * 5000);
    }
    next();
  }

  function stopTechnicalGlitch() {
    glitchTimers.forEach(function (id) { clearTimeout(id); });
    glitchTimers = [];
    document.querySelectorAll('.match-scoreboard--glitch.is-glitching').forEach(function (board) {
      board.classList.remove('is-glitching');
    });
  }

  function scheduleTechnicalGlitch() {
    stopTechnicalGlitch();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (getMode() !== 'fancy') return;
    document.querySelectorAll('.match-scoreboard--glitch').forEach(function (board) {
      function schedule() {
        var waitId = setTimeout(function () {
          if (getMode() !== 'fancy') return;
          board.classList.add('is-glitching');
          var endId = setTimeout(function () {
            board.classList.remove('is-glitching');
            if (getMode() === 'fancy') schedule();
          }, 1000);
          glitchTimers.push(endId);
        }, 5000 + Math.random() * 5000);
        glitchTimers.push(waitId);
      }
      schedule();
    });
  }

  function launchEmber() {
    if (!el.demonEmbers || getMode() !== 'demon') return;
    var ember = document.createElement('div');
    var dur = 3 + Math.random() * 3;
    var drift = -40 + Math.random() * 80;
    var size = 3 + Math.random() * 5;
    ember.className = 'ember';
    ember.style.setProperty('--x', (Math.random() * 100) + 'vw');
    ember.style.setProperty('--dur', dur + 's');
    ember.style.setProperty('--delay', (Math.random() * 0.4) + 's');
    ember.style.setProperty('--drift', drift + 'px');
    ember.style.setProperty('--size', size + 'px');
    el.demonEmbers.appendChild(ember);
    ember.addEventListener('animationend', function () { ember.remove(); });
  }

  function stopEmbers() {
    if (emberTimer) { clearInterval(emberTimer); emberTimer = null; }
    if (el.demonEmbers) el.demonEmbers.innerHTML = '';
  }

  function scheduleEmbers() {
    stopEmbers();
    if (getMode() !== 'demon') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    emberTimer = setInterval(launchEmber, 220);
  }

  function refreshFx() {
    var mode = getMode();
    if (mode === 'fancy') {
      scheduleSkyBall();
      scheduleTechnicalGlitch();
    } else {
      stopSkyBalls();
      stopTechnicalGlitch();
    }
    if (mode === 'demon') scheduleEmbers();
    else stopEmbers();
  }

  /* ---------- demon time: music player break-and-swap ---------- */
  function afterGlitch(done) {
    var fired = false;
    function run() {
      if (fired) return;
      fired = true;
      el.mediaPlayer.removeEventListener('animationend', run);
      done();
    }
    el.mediaPlayer.addEventListener('animationend', run);
    setTimeout(run, 950);
  }

  function enterDemonMode() {
    preDemonState = {
      trackIdx: trackIdx,
      musicOn: musicOn,
      shuffleOrder: shuffleOrder.slice(),
      shufflePos: shufflePos
    };
    if (el.mediaSkip) el.mediaSkip.hidden = true;
    if (el.mediaTracksWrap) el.mediaTracksWrap.hidden = true;
    closeTrackMenu();
    if (!el.mediaPlayer || !el.mediaAudio) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wasPlaying = musicOn;
    clearFade();
    releaseTrackBusy();
    trackBusy = true;

    function swap() {
      el.mediaPlayer.classList.remove('media-player--glitch');
      el.mediaPlayer.classList.add('media-player--demon');
      el.mediaTrack.textContent = DEMON_TRACK.label;
      el.mediaTrack.title = DEMON_TRACK.label;
      el.mediaAudio.loop = true;
      el.mediaAudio.src = DEMON_TRACK.file;
      if (wasPlaying) {
        whenTrackReady(function () { playLoadedTrack(true, releaseTrackBusy); });
      } else {
        el.mediaAudio.load();
        releaseTrackBusy();
      }
    }

    if (reduced) {
      swap();
    } else {
      el.mediaPlayer.classList.add('media-player--glitch');
      afterGlitch(swap);
    }
  }

  function exitDemonMode() {
    if (el.mediaSkip) el.mediaSkip.hidden = false;
    if (el.mediaTracksWrap) el.mediaTracksWrap.hidden = false;
    if (!el.mediaPlayer || !el.mediaAudio) return;

    el.mediaAudio.loop = false;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    clearFade();
    releaseTrackBusy();
    trackBusy = true;

    function swap() {
      el.mediaPlayer.classList.remove('media-player--glitch', 'media-player--demon');
      var resume = preDemonState || { trackIdx: 0, musicOn: false, shuffleOrder: shuffleOrder, shufflePos: shufflePos };
      shuffleOrder = resume.shuffleOrder;
      shufflePos = resume.shufflePos;
      preDemonState = null;
      loadAndPlay(resume.trackIdx, resume.musicOn, true, releaseTrackBusy);
    }

    if (reduced) {
      swap();
    } else {
      el.mediaPlayer.classList.add('media-player--glitch');
      afterGlitch(swap);
    }
  }

  /* ---------- music player ---------- */
  function isHurryTrack(i) {
    return TRACKS[i].label.indexOf(' (Hurry!)') !== -1;
  }

  function shuffleEligibleIndices() {
    var out = [];
    var i;
    for (i = 0; i < TRACKS.length; i++) {
      if (!isHurryTrack(i)) out.push(i);
    }
    return out;
  }

  function shuffleArray(arr) {
    for (var j = arr.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = arr[j];
      arr[j] = arr[k];
      arr[k] = tmp;
    }
    return arr;
  }

  function buildShuffleOrder(opts) {
    opts = opts || {};
    var pool = shuffleEligibleIndices();
    if (!pool.length) {
      shuffleOrder = [0];
      shufflePos = 0;
      return;
    }
    shuffleOrder = shuffleArray(pool.slice());
    if (opts.avoidFirst != null && shuffleOrder.length > 1 && shuffleOrder[0] === opts.avoidFirst) {
      var swap = 1 + Math.floor(Math.random() * (shuffleOrder.length - 1));
      var t = shuffleOrder[0];
      shuffleOrder[0] = shuffleOrder[swap];
      shuffleOrder[swap] = t;
    }
    shufflePos = 0;
  }

  function nextShuffledIdx() {
    shufflePos++;
    if (shufflePos >= shuffleOrder.length) {
      buildShuffleOrder({ avoidFirst: isHurryTrack(trackIdx) ? null : trackIdx });
      shufflePos = 0;
    }
    return shuffleOrder[shufflePos];
  }

  function getTargetVol() {
    return el.mediaVol ? el.mediaVol.value / 100 : 0.3;
  }

  function clearFade() {
    if (fadeRaf) { cancelAnimationFrame(fadeRaf); fadeRaf = null; }
  }

  function releaseTrackBusy() {
    trackBusy = false;
  }

  function fadeVolume(to, ms, done) {
    clearFade();
    if (!ms || !el.mediaAudio) {
      if (el.mediaAudio) el.mediaAudio.volume = to;
      if (done) done();
      return;
    }
    var from = el.mediaAudio.volume;
    var start = performance.now();
    function step(now) {
      var t = Math.min(1, (now - start) / ms);
      el.mediaAudio.volume = from + (to - from) * t;
      if (t < 1) fadeRaf = requestAnimationFrame(step);
      else { fadeRaf = null; if (done) done(); }
    }
    fadeRaf = requestAnimationFrame(step);
  }

  function setTrackSource(i) {
    trackIdx = i;
    el.mediaAudio.src = TRACKS[trackIdx].file;
    updateTrackUi();
  }

  function whenTrackReady(run) {
    var called = false;
    function cleanup() {
      el.mediaAudio.removeEventListener('canplay', onReady);
      el.mediaAudio.removeEventListener('error', onErr);
    }
    function onReady() {
      if (called) return;
      called = true;
      cleanup();
      run();
    }
    function onErr() {
      if (called) return;
      called = true;
      cleanup();
      releaseTrackBusy();
      setPlayUi(false);
    }
    el.mediaAudio.addEventListener('canplay', onReady);
    el.mediaAudio.addEventListener('error', onErr);
    el.mediaAudio.load();
  }

  function playLoadedTrack(fadeIn, done) {
    var targetVol = getTargetVol();
    el.mediaAudio.volume = fadeIn ? 0 : targetVol;
    var p = el.mediaAudio.play();
    if (!p || !p.then) {
      if (done) done();
      return;
    }
    p.then(function () {
      setPlayUi(true);
      if (fadeIn) fadeVolume(targetVol, FADE_MS, done || releaseTrackBusy);
      else if (done) done();
      else releaseTrackBusy();
    }).catch(function () {
      releaseTrackBusy();
      setPlayUi(false);
    });
  }

  function loadAndPlay(i, shouldPlay, fadeIn, done) {
    setTrackSource(i);
    if (!shouldPlay) {
      el.mediaAudio.load();
      releaseTrackBusy();
      if (done) done();
      return;
    }
    whenTrackReady(function () {
      playLoadedTrack(fadeIn, done || releaseTrackBusy);
    });
  }

  function setPlayUi(on) {
    musicOn = on;
    el.mediaPlay.innerHTML = on ? '&#10074;&#10074;' : '&#9654;';
    el.mediaPlay.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    el.mediaPlay.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function updateTrackUi() {
    var t = TRACKS[trackIdx];
    el.mediaTrack.textContent = t.label;
    el.mediaTrack.title = t.label + ' (' + (trackIdx + 1) + '/' + TRACKS.length + ')';
    if (el.mediaMenu) {
      el.mediaMenu.querySelectorAll('[data-idx]').forEach(function (btn) {
        var on = parseInt(btn.getAttribute('data-idx'), 10) === trackIdx;
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
  }

  function closeTrackMenu() {
    if (!el.mediaMenu) return;
    el.mediaMenu.hidden = true;
    el.mediaList.setAttribute('aria-expanded', 'false');
  }

  function openTrackMenu() {
    el.mediaMenu.hidden = false;
    el.mediaList.setAttribute('aria-expanded', 'true');
  }

  function toggleTrackMenu() {
    if (el.mediaMenu.hidden) openTrackMenu();
    else closeTrackMenu();
  }

  function goToTrack(i, shouldPlay, fadeOutFirst) {
    clearFade();
    releaseTrackBusy();
    i = (i + TRACKS.length) % TRACKS.length;
    if (i === trackIdx && shouldPlay && !fadeOutFirst && !el.mediaAudio.ended &&
        !el.mediaAudio.paused && el.mediaAudio.src) return;

    var playing = shouldPlay && musicOn && !el.mediaAudio.paused && !el.mediaAudio.ended;

    function startNext() {
      trackBusy = true;
      loadAndPlay(i, shouldPlay, true, releaseTrackBusy);
    }

    if (fadeOutFirst && playing && el.mediaAudio.src) {
      trackBusy = true;
      fadeVolume(0, FADE_MS, function () {
        el.mediaAudio.pause();
        startNext();
      });
    } else {
      startNext();
    }
  }

  function skipTrack() {
    goToTrack(nextShuffledIdx(), musicOn, true);
  }

  function initMedia() {
    if (!el.mediaAudio) return;
    var vol = 0.3;
    try {
      if (localStorage.getItem(VOL_KEY) !== null) {
        var saved = parseFloat(localStorage.getItem(VOL_KEY));
        if (!isNaN(saved)) vol = Math.max(0, Math.min(1, saved));
      }
    } catch (e) { /* ignore */ }
    el.mediaAudio.volume = 0;
    el.mediaVol.value = Math.round(vol * 100);

    if (el.mediaMenu) {
      el.mediaMenu.innerHTML = TRACKS.map(function (t, i) {
        return '<li><button type="button" role="option" data-idx="' + i + '">' + esc(t.label) + '</button></li>';
      }).join('');
    }

    buildShuffleOrder();

    if (getMode() === 'demon') {
      if (el.mediaSkip) el.mediaSkip.hidden = true;
      if (el.mediaTracksWrap) el.mediaTracksWrap.hidden = true;
      if (el.mediaPlayer) el.mediaPlayer.classList.add('media-player--demon');
      el.mediaTrack.textContent = DEMON_TRACK.label;
      el.mediaTrack.title = DEMON_TRACK.label;
      el.mediaAudio.loop = true;
      el.mediaAudio.src = DEMON_TRACK.file;
      el.mediaAudio.load();
    } else {
      trackBusy = true;
      loadAndPlay(shuffleOrder[0], true, true, releaseTrackBusy);
    }

    el.mediaPlay.addEventListener('click', function () {
      if (musicOn) {
        clearFade();
        releaseTrackBusy();
        el.mediaAudio.pause();
        el.mediaAudio.volume = getTargetVol();
        setPlayUi(false);
        return;
      }
      if (trackBusy) return;
      trackBusy = true;
      if (!el.mediaAudio.src) setTrackSource(trackIdx);
      whenTrackReady(function () {
        playLoadedTrack(true, releaseTrackBusy);
      });
    });

    el.mediaSkip.addEventListener('click', skipTrack);

    if (el.mediaList) {
      el.mediaList.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleTrackMenu();
      });
    }

    if (el.mediaMenu) {
      el.mediaMenu.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-idx]');
        if (!btn) return;
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        closeTrackMenu();
        if (!isHurryTrack(idx)) shufflePos = shuffleOrder.indexOf(idx);
        goToTrack(idx, true, true);
      });
    }

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.drop-tracks')) closeTrackMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeTrackMenu();
    });

    el.mediaVol.addEventListener('input', function () {
      var v = getTargetVol();
      if (!fadeRaf) el.mediaAudio.volume = v;
      try { localStorage.setItem(VOL_KEY, String(v)); } catch (e) { /* ignore */ }
    });

    el.mediaAudio.addEventListener('ended', function () {
      if (musicOn) goToTrack(nextShuffledIdx(), true, false);
    });
  }

  function renderMatchVideo(m) {
    var id = youtubeVideoId(m.video);
    if (!id) return '';
    var label = m.label || m.date || 'Match replay';
    return '<div class="match-actions">' +
      '<button type="button" class="match-video-btn" data-video-id="' + esc(id) + '" data-video-label="' + esc(label) + '">' +
      '&#9654; Video</button></div>';
  }

  function youtubeVideoId(url) {
    if (!url) return null;
    var s = String(url);
    var m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(s) ? s : null;
  }

  function initVideoLightbox() {
    var lb = document.getElementById('video-lightbox');
    if (!lb) return;
    var frame = document.getElementById('video-frame');
    var cap = document.getElementById('video-lightbox-cap');
    var closeBtn = lb.querySelector('.lightbox-close');
    if (!frame) return;

    function closeVideo() {
      lb.hidden = true;
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      frame.removeAttribute('src');
    }

    function openVideo(id, label) {
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      if (cap) cap.textContent = label;
      lb.hidden = false;
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.match-video-btn');
      if (!btn) return;
      openVideo(btn.getAttribute('data-video-id'), btn.getAttribute('data-video-label') || 'Match replay');
    });

    lb.addEventListener('click', function (e) {
      if (e.target === frame) return;
      closeVideo();
    });

    closeBtn.addEventListener('click', closeVideo);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lb.hidden) closeVideo();
    });
  }

  function initPortraitLightbox() {
    var lb = document.getElementById('portrait-lightbox');
    if (!lb) return;
    var img = lb.querySelector('.lightbox-img');
    var cap = document.getElementById('lightbox-cap');
    var closeBtn = lb.querySelector('.lightbox-close');

    function closeLightbox() {
      lb.hidden = true;
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      img.removeAttribute('src');
    }

    function openLightbox(src, name) {
      img.src = src;
      img.alt = name + ' portrait';
      cap.textContent = name;
      lb.hidden = false;
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.portrait-btn');
      if (btn) {
        openLightbox(btn.getAttribute('data-portrait'), btn.getAttribute('data-name'));
      }
    });

    lb.addEventListener('click', function (e) {
      if (e.target.classList.contains('lightbox-img')) return;
      closeLightbox();
    });

    closeBtn.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lb.hidden) closeLightbox();
    });
  }

  /* ---------- Season 1 compute ---------- */
  function freshStanding(slug) {
    return {
      slug: slug, points: 0, wins: 0, podiums: 0,
      holesWon: 0, knockouts: 0, parDelta: 0, holesDone: 0, played: 0
    };
  }

  function applyResult(t, r) {
    t.points += num(r.score);
    t.holesWon += num(r.holesWon);
    t.knockouts += num(r.knockouts);
    t.parDelta += num(r.parDelta);
    t.holesDone += num(r.holesDone);
    t.played += 1;
    if (r.place === 1) t.wins += 1;
    if (r.place >= 1 && r.place <= 3) t.podiums += 1;
  }

  function accumulateMatch(totals, m) {
    (m.results || []).forEach(function (r) {
      var t = totals[r.player] || (totals[r.player] = freshStanding(r.player));
      applyResult(t, r);
    });
  }

  function sortStandings(totals) {
    return Object.keys(totals).map(function (k) { return totals[k]; })
      .sort(function (a, b) { return (b.points - a.points) || (a.parDelta - b.parDelta); });
  }

  function buildMatchSnapshots(matches) {
    var totals = {};
    var snapshots = [];
    (matches || []).forEach(function (m) {
      accumulateMatch(totals, m);
      snapshots.push(sortStandings(totals).map(function (s) {
        return {
          slug: s.slug,
          points: s.points,
          wins: s.wins,
          played: s.played,
          knockouts: s.knockouts,
          parDelta: s.parDelta
        };
      }));
    });
    return snapshots;
  }

  function computeS1(data) {
    var totals = {};
    (data.matches || []).forEach(function (m) { accumulateMatch(totals, m); });

    var standings = sortStandings(totals);

    // most recent match = last item in the array (always append new matches)
    var last = (data.matches && data.matches.length) ? data.matches[data.matches.length - 1] : null;

    var podium = {};
    if (last) {
      (last.results || []).forEach(function (r) {
        if (r.place === 1) podium.gold = r.player;
        if (r.place === 2) podium.silver = r.player;
        if (r.place === 3) podium.bronze = r.player;
      });
    }
    var green = standings.length ? standings[0].slug : null; // LEADER_METRIC = total points

    return { totals: totals, standings: standings, last: last, podium: podium, green: green };
  }

  function leaderBy(standings, key, dir) {
    if (!standings.length) return null;
    var s = standings.slice().sort(function (a, b) {
      return dir === 'asc' ? a[key] - b[key] : b[key] - a[key];
    });
    return s[0];
  }

  function lastResultFor(last, slug) {
    if (!last) return null;
    var found = null;
    (last.results || []).forEach(function (r) { if (r.player === slug) found = r; });
    return found;
  }

  function renderMatchSnapshot(standings, matchIdx, matchCount) {
    if (!standings.length) return '';
    var nightNum = matchIdx + 1;
    var label = matchIdx === matchCount - 1
      ? 'Season standings after this night (current)'
      : 'Season standings after Night ' + nightNum;
    var rows = '';
    standings.forEach(function (s, i) {
      rows += '<tr>' +
        '<td class="pos">' + (i + 1) + '</td>' +
        '<td class="pl">' + esc(p(s.slug).name) + '</td>' +
        '<td class="num">' + num(s.points) + '</td>' +
        '<td class="num">' + num(s.wins) + '</td>' +
        '<td class="num">' + num(s.played) + '</td>' +
      '</tr>';
    });
    return '<details class="match-snapshot">' +
      '<summary>' + esc(label) + '</summary>' +
      '<div class="snapshot-wrap">' +
        '<p class="snapshot-hint">Rankings frozen after this match, before any later nights.</p>' +
        '<div class="tbl-scroll"><table class="snapshot-tbl">' +
          '<thead><tr><th>#</th><th>Player</th><th class="num">Pts</th><th class="num">1st</th><th class="num">Nights</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table></div>' +
      '</div>' +
    '</details>';
  }

  /* ---------- week-to-week trend charts (Chart.js) ---------- */
  var trendChart = null;
  var trendData = null;
  var trendMode = 'points';
  var trendZoom = 0;
  var TREND_AXIS_NIGHTS = 10;
  var TREND_ZOOM_MAX = 5;
  var TREND_ZOOM_THROUGH = [10, 8, 6, 4, 2];
  var TREND_ZOOM_LABELS = ['10 nights', '8 nights', '6 nights', '4 nights', '2 nights', 'Latest'];

  var TREND_MODES = {
    points: {
      key: 'points',
      btn: 'Points',
      panelClass: 'trend-panel--points',
      accent: '#3fa363',
      grid: 'rgba(63,163,99,0.14)',
      zero: 'rgba(63,163,99,0.35)',
      title: 'Season points after each night',
      leaderLabel: 'points',
      dir: 'desc',
      format: function (v) { return num(v).toLocaleString(); }
    },
    knockouts: {
      key: 'knockouts',
      btn: 'KOs',
      panelClass: 'trend-panel--kos',
      accent: '#8f1010',
      grid: 'rgba(143,16,16,0.16)',
      zero: 'rgba(224,83,58,0.4)',
      title: 'Total knockouts after each night',
      leaderLabel: 'KOs',
      dir: 'desc',
      format: function (v) { return num(v).toLocaleString(); }
    },
    wins: {
      key: 'wins',
      btn: '1st Places',
      panelClass: 'trend-panel--wins',
      accent: '#e3b341',
      grid: 'rgba(227,179,65,0.14)',
      zero: 'rgba(227,179,65,0.35)',
      title: 'First place wins after each night',
      leaderLabel: 'wins',
      dir: 'desc',
      format: function (v) { return String(num(v)); }
    },
    par: {
      key: 'par',
      btn: 'Par',
      panelClass: 'trend-panel--par',
      accent: '#6a8fa8',
      grid: 'rgba(136,168,190,0.22)',
      zero: 'rgba(158,196,220,0.55)',
      title: 'Cumulative strokes vs par (lower is better)',
      leaderLabel: 'vs par',
      dir: 'asc',
      format: function (v) { return signed(num(v)); },
      stepped: true
    }
  };

  function hexToRgba(hex, alpha) {
    var h = String(hex || '#888').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function trendNightLabel(n, matches) {
    if (n === 0) return 'Night 0';
    var m = matches[n - 1];
    if (!m) return 'Night ' + n;
    if (m.date) return 'Night ' + n + ' \u00b7 ' + m.date;
    return m.label || ('Night ' + n);
  }

  function buildTrendData(matches) {
    var list = matches || [];
    var matchCount = list.length;
    var maxNight = Math.max(TREND_AXIS_NIGHTS, matchCount);
    var labels = [];
    var n;
    for (n = 0; n <= maxNight; n++) labels.push(trendNightLabel(n, list));

    var ever = {};
    list.forEach(function (m) {
      (m.results || []).forEach(function (r) { ever[r.player] = true; });
    });

    var series = {};
    var cum = {};
    Object.keys(ever).forEach(function (slug) {
      series[slug] = {
        points: [0],
        knockouts: [0],
        wins: [0],
        par: [0],
        absent: [false]
      };
      cum[slug] = freshStanding(slug);
    });

    function pushPlayed(slug) {
      series[slug].points.push(cum[slug].points);
      series[slug].knockouts.push(cum[slug].knockouts);
      series[slug].wins.push(cum[slug].wins);
      series[slug].par.push(cum[slug].parDelta);
      series[slug].absent.push(false);
    }

    function pushAbsent(slug) {
      series[slug].points.push(cum[slug].points);
      series[slug].knockouts.push(cum[slug].knockouts);
      series[slug].wins.push(cum[slug].wins);
      series[slug].par.push(cum[slug].parDelta);
      series[slug].absent.push(true);
    }

    function pushFuture() {
      Object.keys(series).forEach(function (slug) {
        series[slug].points.push(null);
        series[slug].knockouts.push(null);
        series[slug].wins.push(null);
        series[slug].par.push(null);
        series[slug].absent.push(false);
      });
    }

    for (n = 1; n <= maxNight; n++) {
      var m = list[n - 1];
      if (m) {
        var night = {};
        (m.results || []).forEach(function (r) { night[r.player] = r; });
        Object.keys(series).forEach(function (slug) {
          if (night[slug]) {
            applyResult(cum[slug], night[slug]);
            pushPlayed(slug);
          } else {
            pushAbsent(slug);
          }
        });
      } else {
        pushFuture();
      }
    }

    return { labels: labels, series: series, matchCount: matchCount };
  }

  function trendZoomRange() {
    if (!trendData || !trendData.labels.length) return { min: 0, max: 0 };
    var last = trendData.labels.length - 1;
    var mc = trendData.matchCount || 0;
    if (trendZoom >= TREND_ZOOM_MAX) {
      if (mc <= 1) return { min: 0, max: Math.min(1, last) };
      return { min: mc - 1, max: Math.min(mc, last) };
    }
    var end = Math.max(TREND_ZOOM_THROUGH[trendZoom], mc);
    return { min: 0, max: Math.min(end, last) };
  }

  function trendVisibleYBounds(mode) {
    var cfg = TREND_MODES[mode];
    var r = trendZoomRange();
    var key = cfg.key;
    var minY = null;
    var maxY = null;
    Object.keys(trendData.series).forEach(function (slug) {
      var arr = trendData.series[slug][key];
      var i;
      for (i = r.min; i <= r.max; i++) {
        var v = arr[i];
        if (v == null) continue;
        if (minY === null || v < minY) minY = v;
        if (maxY === null || v > maxY) maxY = v;
      }
    });
    if (minY === null || maxY === null) return null;
    var span = maxY - minY;
    var pad = span > 0 ? span * 0.1 : (cfg.key === 'par' ? 4 : 120);
    return { min: minY - pad, max: maxY + pad };
  }

  function updateTrendZoomUi() {
    var label = document.getElementById('trend-zoom-label');
    var zoomIn = document.getElementById('trend-zoom-in');
    var zoomOut = document.getElementById('trend-zoom-out');
    if (label) label.textContent = TREND_ZOOM_LABELS[trendZoom] || '';
    if (zoomIn) zoomIn.disabled = trendZoom >= TREND_ZOOM_MAX;
    if (zoomOut) zoomOut.disabled = trendZoom <= 0;
  }

  function applyTrendZoom() {
    if (!trendChart) return;
    var xr = trendZoomRange();
    trendChart.options.scales.x.min = xr.min;
    trendChart.options.scales.x.max = xr.max;
    if (trendZoom > 0) {
      var yb = trendVisibleYBounds(trendMode);
      if (yb) {
        trendChart.options.scales.y.min = yb.min;
        trendChart.options.scales.y.max = yb.max;
      }
    } else {
      trendChart.options.scales.y.min = undefined;
      trendChart.options.scales.y.max = undefined;
    }
    trendChart.update();
    updateTrendZoomUi();
  }

  function trendLeader(modeCfg) {
    if (!trendData || !trendData.matchCount) return null;
    var key = modeCfg.key;
    var idx = trendData.matchCount;
    var best = null;
    Object.keys(trendData.series).forEach(function (slug) {
      var v = trendData.series[slug][key][idx];
      if (v == null) return;
      if (!best || (modeCfg.dir === 'desc' ? v > best.val : v < best.val)) {
        best = { slug: slug, val: v };
      }
    });
    return best;
  }

  function updateTrendLead(mode) {
    var lead = document.getElementById('trend-lead');
    var panel = document.getElementById('trend-panel');
    if (!lead || !panel) return;
    var cfg = TREND_MODES[mode];
    panel.className = 'trend-panel ' + cfg.panelClass;
    var top = trendLeader(cfg);
    if (!top) {
      lead.textContent = cfg.title + '. Lines appear once nights are logged.';
      return;
    }
    lead.innerHTML = '<b>' + esc(p(top.slug).name) + '</b> leads with ' +
      esc(cfg.format(top.val)) + ' ' + esc(cfg.leaderLabel) + ' after the latest night.';
  }

  function buildTrendDatasets(mode) {
    var cfg = TREND_MODES[mode];
    return Object.keys(trendData.series).map(function (slug) {
      var pl = p(slug);
      var absent = trendData.series[slug].absent;
      var color = pl.color;
      return {
        label: pl.name,
        data: trendData.series[slug][cfg.key],
        _absent: absent,
        borderColor: color,
        backgroundColor: hexToRgba(color, 0.1),
        borderWidth: 2.5,
        pointRadius: function (ctx) {
          return absent[ctx.dataIndex] ? 4 : 5;
        },
        pointHoverRadius: 7,
        pointBackgroundColor: function (ctx) {
          return absent[ctx.dataIndex] ? 'rgba(11,21,15,0.85)' : color;
        },
        pointBorderColor: color,
        pointBorderWidth: function (ctx) {
          return absent[ctx.dataIndex] ? 2 : 1;
        },
        spanGaps: false,
        tension: cfg.stepped ? 0 : 0.28,
        stepped: cfg.stepped ? 'before' : false,
        segment: {
          borderDash: function (ctx) {
            return absent[ctx.p1DataIndex] ? [7, 5] : undefined;
          }
        }
      };
    });
  }

  function renderTrendChart(mode) {
    if (typeof Chart === 'undefined' || !trendData) return;
    var canvas = document.getElementById('sbg-trend-chart');
    if (!canvas) return;
    var cfg = TREND_MODES[mode];
    if (trendChart) {
      trendChart.destroy();
      trendChart = null;
    }

    var gridHeavy = mode === 'par';
    var xr = trendZoomRange();
    var yb = trendZoom > 0 ? trendVisibleYBounds(mode) : null;
    trendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: buildTrendDatasets(mode)
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#89a195',
              boxWidth: 10,
              boxHeight: 10,
              padding: 14,
              font: { family: 'ui-monospace, Menlo, Consolas, monospace', size: 11 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(11,21,15,0.94)',
            borderColor: cfg.accent,
            borderWidth: 1,
            titleFont: { family: 'Arial Narrow, Helvetica Neue, Arial, sans-serif', size: 14 },
            bodyFont: { family: 'ui-monospace, Menlo, Consolas, monospace', size: 12 },
            callbacks: {
              label: function (ctx) {
                if (ctx.parsed.y == null) return ctx.dataset.label + ': no show';
                var held = ctx.dataset._absent && ctx.dataset._absent[ctx.dataIndex];
                var val = cfg.format(ctx.parsed.y);
                return ctx.dataset.label + ': ' + val + (held ? ' (held, absent)' : '');
              }
            }
          }
        },
        scales: {
          x: {
            min: xr.min,
            max: xr.max,
            ticks: {
              color: '#7d9286',
              autoSkip: false,
              maxRotation: 40,
              font: { family: 'ui-monospace, Menlo, Consolas, monospace', size: 10 }
            },
            grid: {
              color: cfg.grid,
              lineWidth: gridHeavy ? 1 : 1,
              drawTicks: true
            },
            border: { color: 'rgba(35,64,47,0.8)' }
          },
          y: {
            min: yb ? yb.min : undefined,
            max: yb ? yb.max : undefined,
            ticks: {
              color: '#7d9286',
              font: { family: 'ui-monospace, Menlo, Consolas, monospace', size: 10 },
              callback: function (v) { return cfg.key === 'par' ? signed(v) : v; }
            },
            grid: {
              color: function (ctx) {
                if (ctx.tick.value === 0) return cfg.zero;
                return cfg.grid;
              },
              lineWidth: function (ctx) {
                if (ctx.tick.value === 0) return gridHeavy ? 2 : 1.5;
                return gridHeavy ? 1.25 : 1;
              }
            },
            border: { color: 'rgba(35,64,47,0.8)' }
          }
        }
      }
    });
    updateTrendLead(mode);
    updateTrendZoomUi();
  }

  function renderTrendSection() {
    return '<div class="eyebrow">Week to Week</div>' +
      '<section class="trend-panel trend-panel--points" id="trend-panel">' +
        '<div class="trend-head">' +
          '<p class="trend-lead" id="trend-lead">Season trends after each Monday night.</p>' +
          '<div class="trend-head-actions">' +
            '<div class="trend-zoom" role="group" aria-label="Chart zoom">' +
              '<button type="button" class="trend-zoom-btn" id="trend-zoom-out" aria-label="Zoom out">&minus;</button>' +
              '<span class="trend-zoom-label" id="trend-zoom-label">10 nights</span>' +
              '<button type="button" class="trend-zoom-btn" id="trend-zoom-in" aria-label="Zoom in">+</button>' +
            '</div>' +
            '<div class="trend-tabs" role="tablist" aria-label="Trend chart metric">' +
              '<button type="button" class="trend-tab" role="tab" data-trend="points" aria-selected="true">Points</button>' +
              '<button type="button" class="trend-tab" role="tab" data-trend="knockouts" aria-selected="false">KOs</button>' +
              '<button type="button" class="trend-tab" role="tab" data-trend="wins" aria-selected="false">1st Places</button>' +
              '<button type="button" class="trend-tab" role="tab" data-trend="par" aria-selected="false">Par</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="trend-chart-wrap"><canvas id="sbg-trend-chart" aria-label="Week to week season trend chart"></canvas></div>' +
      '</section>';
  }

  function initTrendCharts(matches) {
    if (!matches || !matches.length || typeof Chart === 'undefined') return;
    trendData = buildTrendData(matches);
    trendMode = 'points';
    trendZoom = 0;
    renderTrendChart('points');

    var zoomIn = document.getElementById('trend-zoom-in');
    var zoomOut = document.getElementById('trend-zoom-out');
    if (zoomIn) {
      zoomIn.addEventListener('click', function () {
        if (trendZoom >= TREND_ZOOM_MAX) return;
        trendZoom++;
        applyTrendZoom();
      });
    }
    if (zoomOut) {
      zoomOut.addEventListener('click', function () {
        if (trendZoom <= 0) return;
        trendZoom--;
        applyTrendZoom();
      });
    }

    var tabs = document.querySelectorAll('.trend-tab[data-trend]');
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-trend');
        if (!TREND_MODES[mode] || mode === trendMode) return;
        trendMode = mode;
        tabs.forEach(function (b) {
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        renderTrendChart(mode);
      });
    });
  }

  /* ---------- Season 1 render ---------- */
  function renderS1(data, c) {
    if (!data.matches || !data.matches.length) {
      return '<div class="empty"><div class="big">Season 1 Opens Soon</div>' +
        '<p>Log the first Monday and the desk lights up: standings, the ball race, ' +
        'and every match preserved in the record forever. No takebacks.</p></div>';
    }

    var html = '';

    // hero (gold ball holder = most recent winner)
    var koLeader = leaderBy(c.standings, 'knockouts', 'desc');
    var champ = c.podium.gold;
    if (champ) {
      var pl = p(champ);
      var heldBalls = ball('gold') +
        (c.green === champ ? ball('green') : '') +
        (koLeader && koLeader.slug === champ ? ball('ko') : '');
      var matchMeta = [c.last.date, c.last.course].filter(Boolean).join(' \u00b7 ');
      html += '<div class="eyebrow">Holding the Gold Ball</div>';
      html += '<section class="hero hero-champion">' +
        portrait(champ, '', true, c.last.championImage || null) +
        '<div class="hero-body">' +
          '<div class="hero-tag">' + ball('gold') + ' Reigning Champion &middot; ' + esc(c.last.label || 'Night') + '</div>' +
          (matchMeta ? '<div class="hero-date">' + esc(matchMeta) + '</div>' : '') +
          '<div class="hero-name">' + esc(pl.name) + '</div>' +
          '<div class="hero-handle">' + esc(pl.handle) + '</div>' +
          (c.last.note ? '<div class="hero-quote">' + esc(c.last.note) + '</div>' : '') +
          '<div class="hero-balls">' + heldBalls + '</div>' +
        '</div>' +
      '</section>';
    }

    html += renderTrendSection();

    // ball legend
    html += '<div class="legend">' +
      '<div class="item">' + ball('gold') + '<div class="t"><b>Gold</b><span>1st last Monday</span></div></div>' +
      '<div class="item">' + ball('silver') + '<div class="t"><b>Silver</b><span>2nd last Monday</span></div></div>' +
      '<div class="item">' + ball('bronze') + '<div class="t"><b>Bronze</b><span>3rd last Monday</span></div></div>' +
      '<div class="item">' + ball('green') + '<div class="t"><b>Green</b><span>Season points leader</span></div></div>' +
      '<div class="item">' + ball('ko') + '<div class="t"><b>KO</b><span>Season knockouts leader</span></div></div>' +
    '</div>';

    // standings
    html += '<div class="eyebrow">Season Standings &middot; by total points</div>';
    html += '<div class="standings">';
    c.standings.forEach(function (s, i) {
      var pl = p(s.slug);
      var held = '';
      if (c.podium.gold === s.slug) held += ball('gold');
      if (c.podium.silver === s.slug) held += ball('silver');
      if (c.podium.bronze === s.slug) held += ball('bronze');
      if (c.green === s.slug) held += ball('green');
      if (koLeader && koLeader.slug === s.slug) held += ball('ko');
      html += '<div class="row ' + esc(cardClasses(s.slug, c, koLeader).trim()) + '" style="--pc:' + esc(pl.color) + '">' +
        '<div class="rank">' + (i + 1) + '</div>' +
        portrait(s.slug, 'thumb') +
        '<div class="who"><div class="name">' + esc(pl.name) + '</div>' +
          '<div class="handle">' + esc(pl.handle) + '</div></div>' +
        '<div class="held">' + held + '</div>' +
        seasonStatChips(s) +
      '</div>';
    });
    html += '</div>';

    // fun cards
    var hw = leaderBy(c.standings, 'holesWon', 'desc');
    var par = leaderBy(c.standings, 'parDelta', 'asc');
    var hd = leaderBy(c.standings, 'holesDone', 'desc');
    function card(k, leader, valText) {
      if (!leader) return '';
      return '<div class="stat"><div class="k">' + k + '</div>' +
        '<div class="v">' + esc(p(leader.slug).name) + '</div>' +
        '<div class="n">' + valText + '</div></div>';
    }
    html += '<div class="eyebrow">For Fun &middot; season to date</div>';
    html += '<div class="fun">' +
      card('Most Holes Won', hw, hw ? hw.holesWon + ' holes' : '') +
      card('Most Knockouts', koLeader, koLeader ? koLeader.knockouts + ' KOs' : '') +
      card('Best vs Par', par, par ? signed(par.parDelta) : '') +
      card('Most Holes Finished', hd, hd ? hd.holesDone + ' holes' : '') +
    '</div>';

    // match log (newest first)
    html += '<div class="eyebrow">The Record &middot; every Monday</div>';
    var matchSnapshots = buildMatchSnapshots(data.matches);
    var matchCount = data.matches.length;
    data.matches.slice().reverse().forEach(function (m, revIdx) {
      var matchIdx = matchCount - 1 - revIdx;
      var rows = (m.results || []).slice().sort(function (a, b) { return a.place - b.place; });
      var body = '';
      rows.forEach(function (r) {
        var cls = r.place === 1 ? 'gold-t' : r.place === 2 ? 'silver-t' : r.place === 3 ? 'bronze-t' : '';
        body += '<tr>' +
          '<td class="pos">' + esc(r.place) + '</td>' +
          '<td class="pl ' + cls + '">' + esc(p(r.player).name) + '</td>' +
          '<td class="num">' + num(r.score) + '</td>' +
          '<td class="num">' + num(r.holesWon) + '</td>' +
          '<td class="num">' + num(r.holesDone) + '</td>' +
          '<td class="num">' + signed(num(r.parDelta)) + '</td>' +
          '<td class="num">' + num(r.knockouts) + '</td>' +
        '</tr>';
      });
      var meta = [m.course, m.par ? 'Par ' + m.par : '', m.holes ? m.holes + ' holes' : '']
        .filter(Boolean).join(' \u00b7 ');
      var techTag = m.technicalError
        ? '<span class="match-tag match-tag--error" title="Final score screen missing. Stats reconstructed from memory.">Technical error</span>'
        : '';
      var scoreCls = m.technicalError ? 'tbl-scroll match-scoreboard match-scoreboard--glitch' : 'tbl-scroll';
      html += '<div class="match' + (m.technicalError ? ' match--technical' : '') + '">' +
        '<div class="match-head"><span class="d">' + esc(m.label || m.date) + '</span>' +
          techTag +
          '<span class="c">' + esc(m.date) + (meta ? ' \u00b7 ' + esc(meta) : '') + '</span></div>' +
        renderMatchVideo(m) +
        (m.image ? '<div class="match-art' + (m.imageCrop ? ' match-art--crop' : '') + '"><img src="' + esc(m.image) + '" alt="" loading="lazy"></div>' : '') +
        '<div class="' + scoreCls + '"><table>' +
          '<thead><tr><th>#</th><th>Player</th><th class="num">Points</th><th class="num">Holes Won</th>' +
          '<th class="num">Done</th><th class="num">Par</th><th class="num">KOs</th></tr></thead>' +
          '<tbody>' + body + '</tbody></table></div>' +
        (m.note ? '<div class="match-note">' + esc(m.note) + '</div>' : '') +
        '<div class="match-foot">' + renderMatchSnapshot(matchSnapshots[matchIdx], matchIdx, matchCount) + '</div>' +
      '</div>';
    });

    return html;
  }

  /* ---------- Season 0 render (winner only archive) ---------- */
  function renderS0(data) {
    if (!data.matches || !data.matches.length) {
      return '<div class="empty"><div class="big">Season 0 &middot; The Archive</div>' +
        '<p>The Mondays before the stat desk existed. Winners only, pulled from memory. ' +
        'Old champions get added to data/seasons/S0/current.md as we remember them.</p></div>';
    }
    // win counts
    var wins = {};
    data.matches.forEach(function (m) {
      var ws = Array.isArray(m.winner) ? m.winner : [m.winner];
      ws.forEach(function (w) { if (w) wins[w] = (wins[w] || 0) + 1; });
    });
    var board = Object.keys(wins).map(function (k) { return { slug: k, wins: wins[k] }; })
      .sort(function (a, b) { return b.wins - a.wins; });

    var html = '<div class="eyebrow">Archive Leaders &middot; by wins</div><div class="standings">';
    board.forEach(function (s, i) {
      var pl = p(s.slug);
      html += '<div class="row" style="--pc:' + esc(pl.color) + '">' +
        '<div class="rank">' + (i + 1) + '</div>' + portrait(s.slug, 'thumb') +
        '<div class="who"><div class="name">' + esc(pl.name) + '</div>' +
          '<div class="handle">' + esc(pl.handle) + '</div></div>' +
        '<div class="held"></div>' +
        '<div class="pts"><b>' + s.wins + '</b><span>wins</span></div></div>';
    });
    html += '</div><div class="eyebrow">Mondays</div>';
    data.matches.slice().reverse().forEach(function (m) {
      var ws = (Array.isArray(m.winner) ? m.winner : [m.winner]).map(function (w) { return p(w).name; }).join(' & ');
      html += '<div class="match"><div class="match-head">' +
        '<span class="d">' + esc(m.date) + '</span>' +
        '<span class="c">Winner: ' + esc(ws || 'TBD') + '</span></div>' +
        (m.note ? '<div class="match-note">' + esc(m.note) + '</div>' : '') + '</div>';
    });
    return html;
  }

  /* ---------- Team Matches render (fun nights, no season stakes) ---------- */
  function renderTeam(data) {
    if (!data.matches || !data.matches.length) {
      return '<div class="empty"><div class="big">No Team Nights Yet</div>' +
        '<p>Team mode nights are just for fun and never touch Season 0 or Season 1. ' +
        'Log one in data/seasons/TEAM/current.md and it shows up here.</p></div>';
    }

    var html = '<div class="eyebrow">Team Matches &middot; fun nights, no season points</div>';

    data.matches.slice().reverse().forEach(function (m) {
      var teams = m.teams || [];
      var maxScore = teams.reduce(function (mx, t) { return Math.max(mx, num(t.score)); }, -Infinity);
      var meta = [m.course, m.par ? 'Par ' + m.par : '', m.holes ? m.holes + ' holes' : '']
        .filter(Boolean).join(' · ');

      var teamsHtml = teams.map(function (t) {
        var win = num(t.score) === maxScore;
        var players = (t.players || []).slice().sort(function (a, b) { return num(b.score) - num(a.score); });
        var rows = players.map(function (pl) {
          var plr = p(pl.player);
          return '<div class="team-player">' +
            '<span class="tp-name" style="--pc:' + esc(plr.color) + '">' + esc(plr.name) + '</span>' +
            '<span class="tp-score">' + num(pl.score).toLocaleString() + '</span></div>';
        }).join('');
        return '<div class="team-box' + (win ? ' team-box--win' : '') + '" style="--tc:' + esc(t.color || '#7a8a7f') + '">' +
          '<div class="team-box-head">' +
            '<span class="team-name">' + (win ? '&#127942; ' : '') + esc(t.name) + '</span>' +
            '<span class="team-score">' + num(t.score) + '</span>' +
          '</div>' +
          '<div class="team-players">' + rows + '</div>' +
        '</div>';
      }).join('');

      html += '<div class="match team-match">' +
        '<div class="match-head"><span class="d">' + esc(m.label || m.date) + '</span>' +
          '<span class="c">' + esc(m.date) + (meta ? ' · ' + esc(meta) : '') + '</span></div>' +
        '<div class="team-teams">' + teamsHtml + '</div>' +
        (m.note ? '<div class="match-note">' + esc(m.note) + '</div>' : '') +
      '</div>';
    });

    return html;
  }

  /* ---------- season switching ---------- */
  function showSeason(key) {
    var k = String(key);
    el.viewS1.hidden = k !== '1';
    el.viewS0.hidden = k !== '0';
    el.viewTeam.hidden = k !== 'team';
    if (el.seasonSelect) el.seasonSelect.value = k;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- boot ---------- */
  function fail(e) {
    if (window.console) console.error(e);
    el.error.hidden = false;
    el.viewS1.innerHTML = '';
    el.updated.textContent = '';
  }

  Promise.all([load(FILES.players), load(FILES.s1), load(FILES.s0), load(FILES.team)])
    .then(function (res) {
      var playersData = res[0], s1 = res[1], s0 = res[2], team = res[3];
      (playersData.players || []).forEach(function (pl) { PLAYERS[pl.slug] = pl; });

      el.updated.textContent = s1.updated ? 'Updated ' + s1.updated : '';

      var c = computeS1(s1);
      el.viewS1.innerHTML = renderS1(s1, c);
      el.viewS0.innerHTML = renderS0(s0);
      el.viewTeam.innerHTML = renderTeam(team);

      // optional league note in footer
      load(FILES.league).then(function (lg) {
        if (lg && lg.note) el.footerNote.textContent = lg.note;
      }).catch(function () { /* league note is optional */ });

      if (el.seasonSelect) {
        el.seasonSelect.addEventListener('change', function () {
          showSeason(el.seasonSelect.value);
        });
      }
      el.pillFancy.addEventListener('click', function () { setMode('fancy'); });
      el.pillOptimized.addEventListener('click', function () { setMode('optimized'); });
      if (el.pillDemon) el.pillDemon.addEventListener('click', function () { setMode('demon'); });

      setMode(getMode());
      initMedia();
      initPortraitLightbox();
      initVideoLightbox();
      initTrendCharts(s1.matches);
    })
    .catch(fail);
})();
