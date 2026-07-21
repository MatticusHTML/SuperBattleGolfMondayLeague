# Season 1: Monday League (live, full stats)

This file is the source of truth for Season 1. The site reads only the JSON block
below. To log a Monday, add a new match object to the end of `matches` and update
`updated`. Never delete old matches. See AGENTS.md for the full field guide.

```json
{
  "name": "Super Battle Golf League",
  "season": "S1",
  "seasonLabel": "Season 1: Monday League",
  "updated": "Jul 21, 2026 · afternoon PT",
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
      "imageCrop": true,
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
    },
    {
      "date": "Mon Jun 22",
      "label": "Night 3",
      "par": 5,
      "holes": 45,
      "image": "assets/img/nights/night-3.png",
      "video": "https://youtu.be/EjJkM-lY-Ts",
      "results": [
        { "player": "sandman",     "place": 1, "score": 3930, "holesWon": 13, "holesDone": 42, "parDelta": 14, "knockouts": 66 },
        { "player": "cunder",      "place": 2, "score": 3890, "holesWon": 6,  "holesDone": 44, "parDelta": 7,  "knockouts": 94 },
        { "player": "matticus",    "place": 3, "score": 3770, "holesWon": 1,  "holesDone": 36, "parDelta": 23, "knockouts": 136 },
        { "player": "jester",      "place": 4, "score": 3610, "holesWon": 6,  "holesDone": 38, "parDelta": 18, "knockouts": 84 },
        { "player": "rogue",       "place": 5, "score": 3510, "holesWon": 7,  "holesDone": 39, "parDelta": 2,  "knockouts": 85 },
        { "player": "princegames", "place": 6, "score": 3510, "holesWon": 6,  "holesDone": 41, "parDelta": 19, "knockouts": 102 },
        { "player": "toiletduck",  "place": 7, "score": 3060, "holesWon": 4,  "holesDone": 34, "parDelta": 10, "knockouts": 2 },
        { "player": "slack",       "place": 8, "score": 2010, "holesWon": 2,  "holesDone": 12, "parDelta": 2,  "knockouts": 19 }
      ],
      "note": "Sandman put in the work and walked away with absolute dominance: thirteen holes won and the gold. Princegames dug in at the end and refused to let Matticus take the lead. Déjà vu from Night 2, only this time Jester played the chaos card and handed Sandman the hard W. Cunder said it best in the DMs. Toilet Duck had to bail on hole 37, but his board froze right there: 3060 and done."
    },
    {
      "date": "Mon Jun 29",
      "label": "Night 4",
      "par": 5,
      "holes": 45,
      "image": "assets/img/nights/night-4.png",
      "championImage": "assets/img/players/princegames-champion.png",
      "technicalError": true,
      "results": [
        { "player": "princegames", "place": 1, "score": 4665, "holesWon": 12, "holesDone": 43, "parDelta": 4,  "knockouts": 120 },
        { "player": "jester",      "place": 2, "score": 4660, "holesWon": 8,  "holesDone": 42, "parDelta": 8,  "knockouts": 95 },
        { "player": "toiletduck",  "place": 3, "score": 4480, "holesWon": 9,  "holesDone": 41, "parDelta": 12, "knockouts": 55 },
        { "player": "rogue",       "place": 4, "score": 4400, "holesWon": 7,  "holesDone": 40, "parDelta": -2, "knockouts": 88 },
        { "player": "cunder",      "place": 5, "score": 4290, "holesWon": 6,  "holesDone": 42, "parDelta": 9,  "knockouts": 99 },
        { "player": "sandman",     "place": 6, "score": 4275, "holesWon": 8,  "holesDone": 39, "parDelta": 14, "knockouts": 70 },
        { "player": "matticus",    "place": 7, "score": 4050, "holesWon": 2,  "holesDone": 36, "parDelta": 25, "knockouts": 145 }
      ],
      "note": "A high-scoring slugfest. Princegames came out swinging with roughly 120 hits, the most aggressive round of his life, and edged Jester by a heartbreaking five points: 4665 to 4660. Matticus brought the chaos as always but landed dead last for his trouble. The lasting image: at the very end Cunder led a full attack on Jester, just to make the runner-up sweat one more time."
    },
    {
      "date": "Mon Jul 13",
      "label": "Night 5",
      "course": "Jungle",
      "par": 5,
      "holes": 45,
      "championImage": "assets/img/players/cunder-champion.png",
      "results": [
        { "player": "cunder",      "place": 1, "score": 3640, "holesWon": 11, "holesDone": 40, "parDelta": 12,  "knockouts": 43 },
        { "player": "jester",      "place": 2, "score": 3560, "holesWon": 7,  "holesDone": 43, "parDelta": 13,  "knockouts": 70 },
        { "player": "princegames", "place": 3, "score": 3510, "holesWon": 8,  "holesDone": 43, "parDelta": -2,  "knockouts": 79 },
        { "player": "sandman",     "place": 4, "score": 3485, "holesWon": 5,  "holesDone": 43, "parDelta": -4,  "knockouts": 67 },
        { "player": "toiletduck",  "place": 5, "score": 3415, "holesWon": 9,  "holesDone": 40, "parDelta": 17,  "knockouts": 60 },
        { "player": "rogue",       "place": 6, "score": 3325, "holesWon": 5,  "holesDone": 38, "parDelta": -16, "knockouts": 90 }
      ],
      "note": "Prince was up 300 and getting dogpiled, so he ice-gunned four of them on the 3rd-to-last hole. One item flipped the lobby. Cunder rode the chaos from 5th to gold after joining late. Rogue brought the violence and still finished last."
    },
    {
      "date": "Mon Jul 20",
      "label": "Night 6",
      "course": "Crosswalk",
      "par": 5,
      "holes": 45,
      "image": "assets/img/nights/night-6.png",
      "video": "https://youtu.be/tb-Iy0Xq1pQ",
      "results": [
        { "player": "sandman",     "place": 1, "score": 3700, "holesWon": 9, "holesDone": 41, "parDelta": -4,  "knockouts": 84 },
        { "player": "rogue",       "place": 2, "score": 3585, "holesWon": 9, "holesDone": 40, "parDelta": -5,  "knockouts": 82 },
        { "player": "cunder",      "place": 3, "score": 3495, "holesWon": 4, "holesDone": 42, "parDelta": 18,  "knockouts": 86 },
        { "player": "princegames", "place": 4, "score": 3465, "holesWon": 6, "holesDone": 41, "parDelta": 10,  "knockouts": 64 },
        { "player": "jester",      "place": 5, "score": 3425, "holesWon": 7, "holesDone": 40, "parDelta": 6,   "knockouts": 61 },
        { "player": "matticus",    "place": 6, "score": 3255, "holesWon": 1, "holesDone": 30, "parDelta": 35,  "knockouts": 154 },
        { "player": "toiletduck",  "place": 7, "score": 3240, "holesWon": 2, "holesDone": 36, "parDelta": 4,   "knockouts": 68 },
        { "player": "slack",       "place": 8, "score": 2480, "holesWon": 7, "holesDone": 28, "parDelta": 10,  "knockouts": 43 }
      ]
    }
  ]
}
```
