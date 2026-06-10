# Season 1: Monday League (live, full stats)

This file is the source of truth for Season 1. The site reads only the JSON block
below. To log a Monday, add a new match object to the end of `matches` and update
`updated`. Never delete old matches. See AGENTS.md for the full field guide.

```json
{
  "name": "Super Battle Golf League",
  "season": "S1",
  "seasonLabel": "Season 1: Monday League",
  "updated": "Jun 10, 2026 · afternoon PT",
  "matches": [
    {
      "date": "Mon Jun 8",
      "label": "Night 1",
      "course": "Woodland Bay",
      "par": 5,
      "holes": 45,
      "results": [
        { "player": "rogue",       "place": 1, "score": 3970, "holesWon": 10, "holesDone": 42, "parDelta": -7,  "knockouts": 76 },
        { "player": "sandman",     "place": 2, "score": 3850, "holesWon": 6,  "holesDone": 43, "parDelta": 5,   "knockouts": 84 },
        { "player": "princegames", "place": 3, "score": 3740, "holesWon": 5,  "holesDone": 44, "parDelta": 25,  "knockouts": 90 },
        { "player": "matticus",    "place": 4, "score": 3670, "holesWon": 5,  "holesDone": 38, "parDelta": 32,  "knockouts": 157 },
        { "player": "cunder",      "place": 5, "score": 3580, "holesWon": 5,  "holesDone": 40, "parDelta": 43,  "knockouts": 97 },
        { "player": "toiletduck",  "place": 6, "score": 3570, "holesWon": 8,  "holesDone": 37, "parDelta": 12,  "knockouts": 66 },
        { "player": "jester",      "place": 7, "score": 3480, "holesWon": 4,  "holesDone": 35, "parDelta": 23,  "knockouts": 107 },
        { "player": "slack",       "place": 8, "score": 1080, "holesWon": 2,  "holesDone": 5,  "parDelta": -4,  "knockouts": 10 }
      ],
      "note": "Rogue ran away with it. Toilet Duck quietly won 8 holes and still landed 6th. Slack joined late for the last five holes and still posted a cool 1080."
    }
  ]
}
```
