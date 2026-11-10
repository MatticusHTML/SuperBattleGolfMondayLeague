# AGENTS.md: Super Battle Golf League

Read this before editing anything. It explains how the site works, what every data
field means, and the rules to follow so updates do not break the schema or the look.

## What this is

A static GitHub Pages stat tracker for a friend group that plays **Super Battle Golf**
every Monday (one match, 45 holes). The site is the official league record. It is
**OVERSIGHT style**: one dashboard people actually use, not a maze of pages.

There is no backend. The site is plain HTML, CSS, and one vanilla JS engine. Stats live
in markdown files under `data/`, each holding a single fenced ` ```json ` block. The
engine reads only that JSON. **Never hard-code stats into the CSS or JS.** To change the
league, edit the JSON, not the engine.

## File tree

```
index.html                     dashboard shell (mount points only)
AGENTS.md                      this file
README.md                      human quick start
assets/
  css/app.css                  all styling. no stats here.
  js/app.js                    the engine. derives everything. no stats here.
  img/{gold,silver,bronze,green}.png   the four ball icons
data/
  players.json                 the roster
  league/current.md            optional footer note
  seasons/
    S0/current.md              Season 0 archive (winner only)
    S1/current.md              Season 1 live (full stats)
    TEAM/current.md            Team Matches (fun nights, no season stakes)
```

## Seasons

- **Season 0: The Archive.** The weeks played before tracking started. Records only who
  won each Monday. Backfill from memory. Lives in `data/seasons/S0/current.md`.
- **Season 1: Monday League.** The live full-stat season. Night 1 is the first match.
  Lives in `data/seasons/S1/current.md`.
- **Team Matches: Fun Nights.** Team mode games, purely for fun. They never feed Season
  0 or Season 1 standings, the ball system, or anyone's season points. Selectable from
  the same season dropdown. Lives in `data/seasons/TEAM/current.md`.

## The four balls

The engine assigns these automatically. Do not set them by hand. (In the Duel Winners theme the
ball icons are drawn as bullets instead. Same logic, different art.)

- **Gold ball** = 1st place in the most recent Season 1 match (the reigning champion).
- **Silver ball** = 2nd place in the most recent match.
- **Bronze ball** = 3rd place in the most recent match.
- **Green ball** = season points leader, meaning the highest total `score` added up across
  every Season 1 match. The gold and green can be different people, and that is the point.

If you ever want green to mean something else (for example a placement-points system), it
is one spot in `assets/js/app.js`: the `green` line inside `computeS1` and the comment
marked `LEADER_METRIC`.

## The three flags

Flags rank the season's **total holes finished** (`holesDone` summed across every Season 1
match). They sit beside the balls in the standings rows, the champion hero, and the legend.
The engine assigns them automatically, so never set them by hand.

- **Gold flag** = most holes finished this season.
- **Silver flag** = 2nd most.
- **Bronze flag** = 3rd most.

A tie in total holes is broken by season points. The icons are `assets/img/flag-gold.svg`,
`flag-silver.svg` and `flag-bronze.svg`, wired up as `--flag-*` in `assets/css/app.css`.
Flags never change a standings row's card styling. Only the balls do that.

## Season 1 match schema

Each match in the `matches` array:

```json
{
  "date": "Mon Jun 8",      // short human date, shown on the card
  "label": "Night 1",       // optional headline label
  "course": "Woodland Bay", // optional
  "par": 5,                 // optional, per hole
  "holes": 45,              // optional
  "results": [ ... ],       // one object per player who played, see below
  "note": "..."             // optional one-liner, shown under the table and as the champ quote
  "video": "..."            // optional, one replay link (public YouTube watch link)
  "videos": [ ... ]         // optional, several replays, for example POV recordings (see Replays popup)
  "image": "..."            // optional, fun art on the match card in The Record
  "championImage": "..."    // optional, hero banner only while this match is the most recent
}
```

Each object in `results` is one player's line from the in-game results screen:

| Field       | Meaning (from the SBG results screen)                                  |
|-------------|------------------------------------------------------------------------|
| `player`    | the player slug (must match a slug in players.json)                    |
| `place`     | final rank that night, 1 = winner. Drives gold/silver/bronze.          |
| `score`     | the in-game **Score** column (total points). Highest wins. Sums into season points. |
| `holesWon`  | the trophy column. Holes that player finished first. Sums to total holes across the lobby. |
| `holesDone` | the green flag column. Holes the player completed before time ran out. |
| `parDelta`  | the club column. Total strokes vs par. Lower is better, can be negative. |
| `knockouts` | the red column. Knockouts / combat hits landed. Higher is the chaos crown. |

Only `player`, `place`, and `score` are required for the core ball system to work. The
other four power the "for fun" cards. Log all six when you have them.

Ties: if two players share a place, give them the same `place` number and use the standard
sports numbering that skips the next place (two players tied for 1st means the next player is
3rd, and nobody is 2nd). The engine handles the rest: every player tied for 1st gets a win and
holds the gold ball, the champion section turns into "Sharing the Gold Ball" with the
co-champions side by side, and the same sharing applies to silver and bronze. A normal night with
one winner looks exactly as before.

## Season tracker banner

The banner above "Holding the Gold Ball" shows how long until Season 1 ends and which Monday
golf nights are left. It is all derived, so there is nothing to edit per night:

- `seasonEnd` in `data/seasons/S1/current.md` (for example `"2026-12-31"`) is the last day of
  the season. Remove the field to hide the banner.
- Remaining nights are every Monday after the last logged match that is not already in the
  past, through `seasonEnd`. Posting a night removes it from the list by itself.
- It reads each match's `date` (like `Mon Oct 12`) to know what has been played, so keep that
  format. The year comes from `seasonEnd`.
- A Monday that gets skipped and never logged drops off the list once that day has passed.

## Replays popup

The Replays button beside the music player opens a list of every Season 1 night that has a
`video` link, newest first, and clicking one plays it. To add a night, put
`"video": "https://youtu.be/XXXXXXXXXXX"` on the match. It then shows in the popup and gets a
Video button on its match card. Use the public watch link, not the YouTube Studio edit link.

When a night has more than one recording (for example each player's POV), use `videos` instead
of `video`:

```json
"videos": [
  { "label": "Matt POV",   "url": "https://youtu.be/XXXXXXXXXXX" },
  { "label": "Cunder POV", "url": "https://youtu.be/YYYYYYYYYYY" }
]
```

Each entry gets its own labeled button on the match card and its own row in the popup. `video`
and `videos` can be combined, and a night with only `video` keeps working as before.

## Themes, opening splash and default theme

The theme dropdown in the top bar has four choices. The visible names are in `index.html`
(`#theme-select`) and the values are what the code uses:

| Dropdown name              | value       |
|----------------------------|-------------|
| Default: Fancy             | `fancy`     |
| Default: Performance Mode  | `optimized` |
| Duel Winners               | `duel`      |
| Demon Time                 | `demon`     |

To add a bonus theme later: add an `<option>` there, add its value to the `MODES` lists in
`assets/js/app.js` and in the boot script in `index.html`, and write a `.mode-<value>` block in
`assets/css/app.css` (the `.mode-duel` block shows how the color tokens, even the ball icons, are
swapped). A theme that needs its own background animation can start and stop it from `refreshFx()`
in `app.js`, the way Duel Winners does with `SBG_DUEL`.

### Duel Winners (temporary theme, built for the Night 21 tie)

A John Wick style black club fight. Orange, blue and white lasers sweep the background, tracer
rounds streak across and burst into sparks, and brass casings drift down. In this theme the ball
icons are bullets (`assets/img/bullet-{gold,silver,bronze,green,ko}.svg`, swapped through the
`--ball-*` variables in the `.mode-duel` block). The flags stay flags.

- Engine: `assets/js/duel-fx.js` (canvas, started and stopped by `refreshFx()`), look: the
  "duel winners theme" sections of `assets/css/app.css`. With "reduce motion" on, it draws one
  still frame instead of animating.
- Music: `duelTrack` in `SBG_CONFIG` is the song (`assets/audio/legendary-suit-man-ultimate-mix-
  tape.mp3`). Like Demon Time, the player glitches and swaps to that one song. Set it to `null`
  to keep the normal playlist in this theme.
- It is the default until `defaultModeUntil` (Mon Nov 16, 2026), then new visitors get
  `defaultModeAfter` (`'fancy'`) automatically. It stays in the dropdown. To retire it for good,
  delete its `<option>` and its `.mode-duel` sections.

The splash and default theme are controlled by the `window.SBG_CONFIG` block at the top of
`index.html`. Edit the values there and nothing else needs to change:

- `defaultMode` (`'fancy'`, `'optimized'`, `'demon'` or `'duel'`) is the theme for anyone who has
  not picked one. It is currently `'duel'`. A theme is only remembered after a visitor picks one
  from the dropdown, so changing this changes the first impression for everyone who never did.
- `defaultModeUntil` (`YYYY-MM-DD`) is the date the default switches to `defaultModeAfter` on its
  own. Delete the line to keep `defaultMode` forever.
- `splash` turns the opening splash on or off. `splashUntil` (`YYYY-MM-DD`) makes it stop on that
  date by itself. Delete the line to keep showing it.
- `splashSeconds` is how long the splash stays up before it fades out on its own (currently 20).
- The current splash is a John Wick style VERSUS screen for the Night 21 tie: Sandman (orange rim
  light, left) against Cunder (blue rim light, right), with lasers and tracer fire running behind
  them. The art is one transparent WebP (`assets/img/splash/duel-vs-2.webp`, 3:2; the first version,
  `duel-vs.webp`, is kept on purpose with Cunder's angry side-eye face). The page cuts it
  into a left half and a right half with `clip-path` so the two fighters slam in from opposite
  sides, then the VS mark, the name plates and the "Night 21 · 3840 points each" line land. The
  text is real HTML in `index.html` (`#splash`), so changing a name or score never needs new art.
- It is set to stop on `splashUntil` (Mon Nov 16, 2026), the same day the Duel Winners theme stops
  being the default. It plays once per browser session, never with "reduce motion" on, and a click,
  tap, Esc, Enter or Space skips it.
- To preview it, add `?splash` to the address (or `?splash=hold` to keep it on screen).
- To make a future splash: swap the image and the text in the `#splash` markup in `index.html`,
  adjust `.vs-*` in `assets/css/app.css` if the art is a different shape, and move `splashUntil`.
  The old fire and horror devil splash art (`assets/img/splash/devil-horror.webp`) is kept in the
  repo for history but nothing references it now.
- The engine is `assets/js/splash.js` (starts the lasers, handles the timer and the skip) and the
  look is the splash section of `assets/css/app.css`. The lasers come from
  `SBG_LASERS.create(canvas, { intensity })` in `assets/js/duel-fx.js`, the same scene the Duel
  Winners theme background uses. `duel-fx.js` must load before `splash.js` in `index.html`.

### Music start-up

When the theme in use is Demon Time or Duel Winners (the default if `defaultMode` is that theme,
otherwise a visitor picked it) the music opens playing that theme's song (the Demon Time Mix, or
the `duelTrack` song) at 40% volume (`DEFAULT_VOL` near
the top of `assets/js/app.js`). Browsers usually block sound until the visitor touches the page,
so the engine tries to play right away and, if the browser refuses, starts the music on the
visitor's first click, tap or key press. On the splash that is the same tap that skips it. A
visitor who moves the volume slider keeps their own level (saved in their browser), and the other
themes keep their old behavior.

## Season 0 match schema (winner only)

```json
{ "date": "May 26", "winner": "princegames", "note": "optional" }
```

`winner` can be a single slug or an array of slugs for a tie. That is all S0 needs.

## Team Matches schema (fun nights, no season stakes)

Team mode results screens track far less than a real Monday: no holes won, par, or
knockouts, just each player's `score`. The engine works out which team won on its own
(highest team `score`), so never set a "winner" flag by hand.

```json
{
  "date": "Mon Jul 27",       // short human date
  "label": "Team Night 1",    // optional headline label
  "course": "Taiga",          // optional
  "par": 4,                   // optional
  "holes": 45,                // optional
  "teams": [
    {
      "name": "Red Team",
      "color": "#c23b3b",     // hex used for that team's header tint
      "score": 26,            // the trophy number from the results screen
      "players": [
        { "player": "cunder", "score": 3230 }
      ]
    }
  ],
  "note": "optional one-liner"
}
```

`player` must match a slug in `players.json`, same as Season 1. Guests who show up
for a team night only (no regular roster slug yet) still get added to `players.json`
so their name and color render properly; it costs nothing since they simply never
appear in any Season 0/1 match `results` array and can't affect those standings.

The "+10 / +105" rank-change number and the small ping number shown per player on the
in-game results screen are not tracked. Only `score` matters here.

## players.json schema

```json
{ "slug": "rogue", "name": "Rogue", "handle": "Rogue_Amputee", "color": "#e0772f", "avatar": null }
```

- `slug` is the stable key used everywhere in the match data. Do not change it once set.
- `name` is the display name. `handle` is the in-game name.
- `color` is a hex used for that player's accent (row stripe, portrait ring).
- `avatar` is a path to a 500x500 portrait, or null for a gray placeholder. When the real
  portraits arrive, drop them in (for example `assets/img/players/rogue.png`) and set
  `"avatar": "assets/img/players/rogue.png"`.

### Picture viewer and outfit history

Clicking any player's portrait (standings, champion section) opens a viewer with zoom (mouse
wheel, pinch, tap, +/- buttons), panning, arrow keys or swipe to browse, and a thumbnail strip.
The slides for each player are built automatically, in this order:

1. `avatar`, labeled "Current".
2. Any `championImage` from a night that player won, labeled "Winner pic" (newest first).
3. The player's optional `gallery` in `players.json`, newest first. These are earlier outfits:

```json
{ "slug": "cunder", ..., "avatar": "assets/img/players/cunder.png",
  "gallery": [ { "src": "assets/img/players/history/cunder-2026-09.png", "label": "September 2026" } ] }
```

A player with only one picture still gets the zoom viewer, just without arrows or a strip.

**When a player gets a new portrait:** do not overwrite and lose the old one.
1. Move the old `assets/img/players/<slug>.png` into `assets/img/players/history/` as
   `<slug>-YYYY-MM.png` (git history is not needed, the file just lives there).
2. Add it at the **top** of that player's `gallery` with a label such as "October 2026".
3. Save the new picture as `assets/img/players/<slug>.png`.

Everything in `assets/img/players/history/` is kept on purpose and is only referenced from
`gallery`, so never delete these. Also kept for history:
- `assets/img/players/matticus-og.png`, Matticus's original devil portrait (his `gallery` points
  at it).
- `assets/img/players/*-champion.png`, older champion hero images (shown as "Winner pic").

Known Steam aliases (map to the roster slug, never create a new player):
- `Aaron` = `sandman`

The roster is read fully and scales to any number of players. Add more players by adding
rows here. Nothing is hard-coded to 8.

## The Monday update workflow

1. After Monday's match, open `data/seasons/S1/current.md`.
2. Add a new match object to the **end** of the `matches` array. Keep it additive, never
   delete old Mondays.
3. Fill `place` and `score` for everyone at minimum. Add the other four stats from the
   results screen if you have them.
4. Update the `updated` field (use Pacific Time, for example `Jun 16, 2026 · evening PT`).
5. Save, commit in GitHub Desktop, push. The site recomputes standings, the balls, the fun
   cards, the champion, the season tracker, and the replays list on its own.

You never edit `meta`, win counts, or who holds a ball. The engine derives all of it.

### No-shows (did not attend that Monday)

**In the match data:** only list players who actually played. Do not add a row for someone
who was absent. Omit them from that night's `results` array entirely (example: Slack on
Night 2). Their season totals in standings only count nights they played.

**On the Week to Week chart:** the engine catches them up automatically. If a player has
played before but is missing from a logged night's `results`, their line:

- **Carries forward** the same cumulative stat (flat, unchanged from the previous night).
- Draws a **dashed horizontal** segment into that night (not a gap, not a drop to zero).
- Uses a **hollow ring** marker on the absent night.
- Shows tooltip text like `1,080 (held, absent)`.

When they return a later Monday, the line resumes solid from the carried value. Do not
change this style unless the user asks. Logic lives in `buildTrendData()` and
`buildTrendDatasets()` in `assets/js/app.js`.


Match notes and any prose should sound like the friend group: friendly roast and hype,
never cruel. Human voice, no stiff uniform phrasing. **No em dashes anywhere in visible
content.** Use periods, commas, or colons instead.

## Testing

The site fetches the data files at runtime, so it will not work by double-clicking
`index.html` off the desktop (the browser blocks local file reads). Test it from the
GitHub Pages URL. If you want a local preview, run a tiny static server from the project
folder and open the localhost address it prints.

## Publishing

The owner uses **GitHub Desktop only**. Do not assume a command line or `git push` in the
terminal. Changes go: edit files, commit in GitHub Desktop, push. GitHub Pages serves from
the `main` branch root.

## Out of scope unless asked

Logins, live score entry, importing weeks we never logged, and any extra flair beyond the
league desk look and the ball system.
