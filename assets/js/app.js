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
    league: 'data/league/current.md'
  };

  var el = {
    updated: document.getElementById('updated'),
    error: document.getElementById('error'),
    pillFancy: document.getElementById('pill-fancy'),
    pillOptimized: document.getElementById('pill-optimized'),
    seasonSelect: document.getElementById('season-select'),
    viewS1: document.getElementById('view-s1'),
    viewS0: document.getElementById('view-s0'),
    footerNote: document.getElementById('footer-note'),
    sky: document.getElementById('sky-balls'),
    mediaPlay: document.getElementById('media-play'),
    mediaSkip: document.getElementById('media-skip'),
    mediaList: document.getElementById('media-list'),
    mediaMenu: document.getElementById('media-menu'),
    mediaTrack: document.getElementById('media-track'),
    mediaVol: document.getElementById('media-vol'),
    mediaAudio: document.getElementById('media-audio')
  };

  var PLAYERS = {};
  var skyTimer = null;
  var fadeRaf = null;
  var trackBusy = false;
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
    { file: 'assets/audio/13-winter-hurry.mp3', label: 'Winter (Hurry!)' }
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

  function portrait(slug, cls, clickable) {
    var pl = p(slug);
    var c = cls || '';
    if (pl.avatar && clickable !== false) {
      return '<button type="button" class="portrait portrait-btn ' + c + '"' +
        ' data-portrait="' + esc(pl.avatar) + '"' +
        ' data-name="' + esc(pl.name) + '"' +
        ' aria-label="View full portrait of ' + esc(pl.name) + '"' +
        ' style="background-image:url(\'' + esc(pl.avatar) + '\')"></button>';
    }
    if (pl.avatar) {
      return '<div class="portrait ' + c + '" style="background-image:url(\'' +
        esc(pl.avatar) + '\')"></div>';
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
    return document.documentElement.classList.contains('mode-optimized') ? 'optimized' : 'fancy';
  }

  function setMode(mode) {
    var fancy = mode !== 'optimized';
    document.documentElement.classList.toggle('mode-fancy', fancy);
    document.documentElement.classList.toggle('mode-optimized', !fancy);
    el.pillFancy.setAttribute('aria-pressed', fancy);
    el.pillOptimized.setAttribute('aria-pressed', !fancy);
    try { localStorage.setItem(MODE_KEY, fancy ? 'fancy' : 'optimized'); } catch (e) { /* ignore */ }
    refreshFx();
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

  function refreshFx() {
    if (getMode() === 'fancy') scheduleSkyBall();
    else stopSkyBalls();
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

  function fadeVolume(to, ms, done) {
    clearFade();
    if (!ms || !el.mediaAudio) {
      el.mediaAudio.volume = to;
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

  function setTrackSource(i) {
    trackIdx = i;
    el.mediaAudio.src = TRACKS[trackIdx].file;
    updateTrackUi();
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
    if (trackBusy) return;
    i = (i + TRACKS.length) % TRACKS.length;
    if (i === trackIdx && el.mediaAudio.src && !shouldPlay && !fadeOutFirst) return;

    var targetVol = getTargetVol();
    var playing = musicOn && !el.mediaAudio.paused;

    function beginNext() {
      setTrackSource(i);
      if (shouldPlay) {
        el.mediaAudio.volume = 0;
        el.mediaAudio.play().then(function () {
          setPlayUi(true);
          trackBusy = true;
          fadeVolume(targetVol, FADE_MS, function () { trackBusy = false; });
        }).catch(function () { setPlayUi(false); trackBusy = false; });
      } else {
        el.mediaAudio.volume = targetVol;
        trackBusy = false;
      }
    }

    if (fadeOutFirst && playing && el.mediaAudio.src) {
      trackBusy = true;
      fadeVolume(0, FADE_MS, function () {
        el.mediaAudio.pause();
        beginNext();
      });
    } else {
      trackBusy = true;
      beginNext();
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
    setTrackSource(shuffleOrder[0]);
    el.mediaAudio.play().then(function () {
      setPlayUi(true);
      fadeVolume(vol, FADE_MS);
    }).catch(function () { setPlayUi(false); el.mediaAudio.volume = vol; });

    el.mediaPlay.addEventListener('click', function () {
      if (trackBusy) return;
      if (musicOn) {
        clearFade();
        el.mediaAudio.pause();
        el.mediaAudio.volume = getTargetVol();
        setPlayUi(false);
        return;
      }
      if (!el.mediaAudio.src) setTrackSource(trackIdx);
      el.mediaAudio.volume = 0;
      el.mediaAudio.play().then(function () {
        setPlayUi(true);
        fadeVolume(getTargetVol(), FADE_MS);
      }).catch(function () { setPlayUi(false); });
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
  function computeS1(data) {
    var totals = {};
    (data.matches || []).forEach(function (m) {
      (m.results || []).forEach(function (r) {
        var t = totals[r.player] || (totals[r.player] = {
          slug: r.player, points: 0, wins: 0, podiums: 0,
          holesWon: 0, knockouts: 0, parDelta: 0, holesDone: 0, played: 0
        });
        t.points += num(r.score);
        t.holesWon += num(r.holesWon);
        t.knockouts += num(r.knockouts);
        t.parDelta += num(r.parDelta);
        t.holesDone += num(r.holesDone);
        t.played += 1;
        if (r.place === 1) t.wins += 1;
        if (r.place >= 1 && r.place <= 3) t.podiums += 1;
      });
    });

    var standings = Object.keys(totals).map(function (k) { return totals[k]; })
      .sort(function (a, b) { return (b.points - a.points) || (a.parDelta - b.parDelta); });

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
        portrait(champ) +
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
    data.matches.slice().reverse().forEach(function (m) {
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
      html += '<div class="match">' +
        '<div class="match-head"><span class="d">' + esc(m.label || m.date) + '</span>' +
          '<span class="c">' + esc(m.date) + (meta ? ' \u00b7 ' + esc(meta) : '') + '</span></div>' +
        '<div class="tbl-scroll"><table>' +
          '<thead><tr><th>#</th><th>Player</th><th class="num">Points</th><th class="num">Holes Won</th>' +
          '<th class="num">Done</th><th class="num">Par</th><th class="num">KOs</th></tr></thead>' +
          '<tbody>' + body + '</tbody></table></div>' +
        (m.note ? '<div class="match-note">' + esc(m.note) + '</div>' : '') +
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

  /* ---------- season switching ---------- */
  function showSeason(n) {
    var on1 = n === 1;
    el.viewS1.hidden = !on1;
    el.viewS0.hidden = on1;
    if (el.seasonSelect) el.seasonSelect.value = String(on1 ? 1 : 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- boot ---------- */
  function fail(e) {
    if (window.console) console.error(e);
    el.error.hidden = false;
    el.viewS1.innerHTML = '';
    el.updated.textContent = '';
  }

  Promise.all([load(FILES.players), load(FILES.s1), load(FILES.s0)])
    .then(function (res) {
      var playersData = res[0], s1 = res[1], s0 = res[2];
      (playersData.players || []).forEach(function (pl) { PLAYERS[pl.slug] = pl; });

      el.updated.textContent = s1.updated ? 'Updated ' + s1.updated : '';

      var c = computeS1(s1);
      el.viewS1.innerHTML = renderS1(s1, c);
      el.viewS0.innerHTML = renderS0(s0);

      // optional league note in footer
      load(FILES.league).then(function (lg) {
        if (lg && lg.note) el.footerNote.textContent = lg.note;
      }).catch(function () { /* league note is optional */ });

      if (el.seasonSelect) {
        el.seasonSelect.addEventListener('change', function () {
          showSeason(parseInt(el.seasonSelect.value, 10));
        });
      }
      el.pillFancy.addEventListener('click', function () { setMode('fancy'); });
      el.pillOptimized.addEventListener('click', function () { setMode('optimized'); });

      setMode(getMode());
      initMedia();
      initPortraitLightbox();
    })
    .catch(fail);
})();
