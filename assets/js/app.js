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
    pillS1: document.getElementById('pill-s1'),
    pillS0: document.getElementById('pill-s0'),
    viewS1: document.getElementById('view-s1'),
    viewS0: document.getElementById('view-s0'),
    footerNote: document.getElementById('footer-note')
  };

  var PLAYERS = {};

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

  function portrait(slug, cls) {
    var pl = p(slug);
    if (pl.avatar) {
      return '<div class="portrait ' + (cls || '') + '" style="background-image:url(\'' +
        esc(pl.avatar) + '\');background-size:cover"></div>';
    }
    return '<div class="portrait ' + (cls || '') + '" style="--pc:' + esc(pl.color) + '">' +
      esc(firstInitial(pl.name)) + '</div>';
  }
  function ball(kind) {
    var label = kind.charAt(0).toUpperCase() + kind.slice(1) + ' ball';
    return '<span class="ball ' + kind + '" role="img" aria-label="' + label + '" title="' + label + '"></span>';
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
    var champ = c.podium.gold;
    if (champ) {
      var pl = p(champ);
      var line = lastResultFor(c.last, champ);
      var chips = '';
      if (line) {
        chips =
          '<span class="chip"><b>' + num(line.score) + '</b> points</span>' +
          '<span class="chip"><b>' + num(line.holesWon) + '</b> holes won</span>' +
          '<span class="chip"><b>' + signed(num(line.parDelta)) + '</b> vs par</span>' +
          '<span class="chip"><b>' + num(line.knockouts) + '</b> knockouts</span>';
      }
      var heldBalls = ball('gold') + (c.green === champ ? ball('green') : '');
      html += '<div class="eyebrow">Holding the Gold Ball</div>';
      html += '<section class="hero">' +
        portrait(champ) +
        '<div class="hero-body">' +
          '<div class="hero-tag">' + ball('gold') + ' Reigning Champion &middot; ' + esc(c.last.label || c.last.date || '') + '</div>' +
          '<div class="hero-name">' + esc(pl.name) + '</div>' +
          '<div class="hero-handle">' + esc(pl.handle) + '</div>' +
          '<div class="hero-line">' + chips + '</div>' +
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
      html += '<div class="row" style="--pc:' + esc(pl.color) + '">' +
        '<div class="rank">' + (i + 1) + '</div>' +
        portrait(s.slug, 'thumb') +
        '<div class="who"><div class="name">' + esc(pl.name) + '</div>' +
          '<div class="handle">' + esc(pl.handle) + '</div></div>' +
        '<div class="held">' + held + '</div>' +
        '<div class="pts"><b>' + s.points + '</b><span>points</span></div>' +
      '</div>';
    });
    html += '</div>';

    // fun cards
    var hw = leaderBy(c.standings, 'holesWon', 'desc');
    var ko = leaderBy(c.standings, 'knockouts', 'desc');
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
      card('Most Knockouts', ko, ko ? ko.knockouts + ' KOs' : '') +
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
    el.pillS1.setAttribute('aria-pressed', on1);
    el.pillS0.setAttribute('aria-pressed', !on1);
    el.viewS1.hidden = !on1;
    el.viewS0.hidden = on1;
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

      el.pillS1.addEventListener('click', function () { showSeason(1); });
      el.pillS0.addEventListener('click', function () { showSeason(0); });
    })
    .catch(fail);
})();
