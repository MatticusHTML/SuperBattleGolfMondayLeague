# Season 1: Monday League (live, full stats)

This file is the source of truth for Season 1. The site reads only the JSON block
below. To log a Monday, add a new match object to the end of `matches` and update
`updated`. Never delete old matches. See AGENTS.md for the full field guide.

```json
{
  "name": "Super Battle Golf League",
  "season": "S1",
  "seasonLabel": "Season 1: Monday League",
  "updated": "Jun 16, 2026 · evening PT",
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
    },
    {
      "date": "Mon Jun 15",
      "label": "Night 2",
      "par": 5,
      "holes": 45,
      "image": "assets/img/nights/night-2.png",
      "championImage": "assets/img/players/cunder-champion.png",
      "results": [
        { "player": "cunder",      "place": 1, "score": 3935, "holesWon": 5,  "holesDone": 41, "parDelta": 7,  "knockouts": 71 },
        { "player": "princegames", "place": 2, "score": 3915, "holesWon": 11, "holesDone": 42, "parDelta": 1,  "knockouts": 73 },
        { "player": "sandman",     "place": 3, "score": 3835, "holesWon": 10, "holesDone": 40, "parDelta": 1,  "knockouts": 73 },
        { "player": "jester",      "place": 4, "score": 3835, "holesWon": 7,  "holesDone": 43, "parDelta": 9,  "knockouts": 7 },
        { "player": "toiletduck",  "place": 5, "score": 3750, "holesWon": 8,  "holesDone": 40, "parDelta": 19, "knockouts": 63 },
        { "player": "matticus",    "place": 6, "score": 3720, "holesWon": 1,  "holesDone": 37, "parDelta": 24, "knockouts": 165 },
        { "player": "rogue",       "place": 7, "score": 3690, "holesWon": 3,  "holesDone": 37, "parDelta": -3, "knockouts": 97 }
      ],
      "note": "Princegames had the win lined up until Matticus stepped into the mine lane. Cunder snuck through and stole the night."
    }
  ]
}
```
