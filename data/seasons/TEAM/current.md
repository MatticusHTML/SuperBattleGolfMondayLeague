# Team Matches: Fun Nights (unofficial, separate from Season 0/1)

These nights are team mode, just for fun. They never touch Season 0 or Season 1
standings, the balls, or the ball system. Only the score column is tracked per
player, since the point is to get through the holes fast, not to grind full stats.

A match needs a date, the two (or more) teams with their team `score` (the trophy
number from the results screen) and a `color`, and each team's `players` array with
`player` (roster slug) and `score`. The engine picks the winning team automatically:
whichever team has the highest `score`. `note` is optional. See AGENTS.md for the
full field guide.

```json
{
  "name": "Super Battle Golf League",
  "season": "TEAM",
  "seasonLabel": "Team Matches: Fun Nights",
  "updated": "Aug 10, 2026 · afternoon PT",
  "matches": [
    {
      "date": "Mon Jul 27",
      "label": "Team Night 1",
      "course": "Taiga",
      "par": 4,
      "holes": 45,
      "teams": [
        {
          "name": "Red Team",
          "color": "#c23b3b",
          "score": 26,
          "players": [
            { "player": "cunder",  "score": 3230 },
            { "player": "rogue",   "score": 2210 },
            { "player": "matticus","score": 2160 }
          ]
        },
        {
          "name": "Blue Team",
          "color": "#3b5bc2",
          "score": 25,
          "players": [
            { "player": "sandman",     "score": 2845 },
            { "player": "toiletduck",  "score": 2725 },
            { "player": "princegames", "score": 1530 },
            { "player": "spacemanjosh","score": 745 }
          ]
        }
      ],
      "note": "First team night, purely for fun, no season points on the line. Cunder's squad edged Sandman's crew 26 to 25 in a nail-biter, with SpacemanJosh crashing the lobby as a guest."
    }
  ]
}
```
