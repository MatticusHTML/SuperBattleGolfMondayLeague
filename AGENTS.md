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
```

## Seasons

- **Season 0: The Archive.** The weeks played before tracking started. Records only who
  won each Monday. Backfill from memory. Lives in `data/seasons/S0/current.md`.
- **Season 1: Monday League.** The live full-stat season. Night 1 is the first match.
  Lives in `data/seasons/S1/current.md`.

## The four balls

The engine assigns these automatically. Do not set them by hand.

- **Gold ball** = 1st place in the most recent Season 1 match (the reigning champion).
- **Silver ball** = 2nd place in the most recent match.
- **Bronze ball** = 3rd place in the most recent match.
- **Green ball** = season points leader, meaning the highest total `score` added up across
  every Season 1 match. The gold and green can be different people, and that is the point.

If you ever want green to mean something else (for example a placement-points system), it
is one spot in `assets/js/app.js`: the `green` line inside `computeS1` and the comment
marked `LEADER_METRIC`.

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

Ties: if two players share a place, give them the same `place` number. The engine handles it.

## Season 0 match schema (winner only)

```json
{ "date": "May 26", "winner": "princegames", "note": "optional" }
```

`winner` can be a single slug or an array of slugs for a tie. That is all S0 needs.

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
   cards, and the champion on its own.

You never edit `meta`, win counts, or who holds a ball. The engine derives all of it.

## Tone of any written copy

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
