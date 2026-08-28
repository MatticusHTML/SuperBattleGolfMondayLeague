# Season 1: Monday League (live, full stats)

This file is the source of truth for Season 1. The site reads only the JSON block
below. To log a Monday, add a new match object to the end of `matches` and update
`updated`. Never delete old matches. See AGENTS.md for the full field guide.

```json
{
  "name": "Super Battle Golf League",
  "season": "S1",
  "seasonLabel": "Season 1: Monday League",
  "updated": "Aug 24, 2026 · evening PT",
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
    },
    {
      "date": "Mon Aug 3",
      "label": "Night 7",
      "holes": 45,
      "image": "assets/img/nights/night-7.png",
      "results": [
        { "player": "jester",      "place": 1, "score": 3680, "holesWon": 12, "holesDone": 40, "parDelta": 3,  "knockouts": 48 },
        { "player": "cunder",      "place": 2, "score": 3500, "holesWon": 10, "holesDone": 40, "parDelta": 9,  "knockouts": 87 },
        { "player": "sandman",     "place": 3, "score": 3435, "holesWon": 11, "holesDone": 36, "parDelta": 8,  "knockouts": 70 },
        { "player": "rogue",       "place": 4, "score": 3335, "holesWon": 5,  "holesDone": 39, "parDelta": 14, "knockouts": 82 },
        { "player": "toiletduck",  "place": 5, "score": 3230, "holesWon": 3,  "holesDone": 37, "parDelta": 23, "knockouts": 64 },
        { "player": "matticus",    "place": 6, "score": 3155, "holesWon": 1,  "holesDone": 34, "parDelta": 20, "knockouts": 138 },
        { "player": "princegames", "place": 7, "score": 3100, "holesWon": 3,  "holesDone": 21, "parDelta": 1,  "knockouts": 57 }
      ],
      "note": "Jester ran wire to wire behind twelve holes won, no drama needed. Sandman disconnected right before the final horn and still held on for third, his 3435 was already in the bank. Matticus stacked 138 knockouts and still finished second to last, the most Matticus stat line possible."
    },
    {
      "date": "Mon Aug 10",
      "label": "Night 8",
      "course": "Serpent Trail",
      "par": 5,
      "holes": 45,
      "image": "assets/img/nights/night-8.png",
      "video": "https://youtu.be/LmzXzFNH5cI",
      "results": [
        { "player": "sandman",     "place": 1, "score": 3910, "holesWon": 14, "holesDone": 42, "parDelta": -7, "knockouts": 62 },
        { "player": "cunder",      "place": 2, "score": 3675, "holesWon": 7,  "holesDone": 40, "parDelta": 16, "knockouts": 87 },
        { "player": "rogue",       "place": 3, "score": 3640, "holesWon": 6,  "holesDone": 34, "parDelta": -6, "knockouts": 71 },
        { "player": "princegames", "place": 4, "score": 3540, "holesWon": 7,  "holesDone": 40, "parDelta": -12,"knockouts": 82 },
        { "player": "toiletduck",  "place": 5, "score": 3470, "holesWon": 4,  "holesDone": 38, "parDelta": 6,  "knockouts": 74 },
        { "player": "jester",      "place": 6, "score": 3400, "holesWon": 6,  "holesDone": 41, "parDelta": 35, "knockouts": 70 },
        { "player": "matticus",    "place": 7, "score": 3350, "holesWon": 1,  "holesDone": 32, "parDelta": 8,  "knockouts": 126 }
      ],
      "note": "Sandman got jumped from every angle all night and still kept sinking shots, the man was unleashed. Cunder made Matticus his personal target, so Matticus and Princegames struck up a scrappy alliance just to survive, the handshake heard round the lobby. Toilet Duck just really, really liked shooting Matticus too. Fourteen holes won and the best par in the lobby got Sandman the gold, while Matticus finished dead last for the second time this season but broke his own KO record with 126."
    },
    {
      "date": "Mon Aug 17",
      "label": "Night 9",
      "holes": 45,
      "image": "assets/img/nights/night-9.jpg",
      "video": "https://youtu.be/qt1hDOcfkKI",
      "results": [
        { "player": "princegames", "place": 1, "score": 3370, "holesWon": 10, "holesDone": 42, "parDelta": 41, "knockouts": 96 },
        { "player": "cunder",      "place": 2, "score": 3320, "holesWon": 8,  "holesDone": 40, "parDelta": 10, "knockouts": 76 },
        { "player": "sandman",     "place": 3, "score": 3310, "holesWon": 11, "holesDone": 39, "parDelta": 18, "knockouts": 81 },
        { "player": "matticus",    "place": 4, "score": 3270, "holesWon": 7,  "holesDone": 40, "parDelta": 26, "knockouts": 120 },
        { "player": "toiletduck",  "place": 5, "score": 3085, "holesWon": 4,  "holesDone": 38, "parDelta": 5,  "knockouts": 77 },
        { "player": "rogue",       "place": 6, "score": 3055, "holesWon": 3,  "holesDone": 33, "parDelta": -3, "knockouts": 69 },
        { "player": "jester",      "place": 7, "score": 2650, "holesWon": 2,  "holesDone": 30, "parDelta": 9,  "knockouts": 84 }
      ],
      "note": "Jester pulled off a late rescue, rocket-clubbing Matticus forward and clearing the enemies in his path, pure teamwork. Toilet Duck and Cunder took it personally and turned their guns on both of them for the rest of the night. Sandman, playing under his Aaron alias, was lights-out on first-place finishes most of the match. Princegames slipped clean through all the chaos and stole the win anyway."
    },
    {
      "date": "Mon Aug 24",
      "label": "Night 10",
      "holes": 45,
      "image": "assets/img/nights/night-10.jpg",
      "video": "https://youtu.be/yV6JZRQV0Jg",
      "results": [
        { "player": "jester",      "place": 1, "score": 3555, "holesWon": 12, "holesDone": 41, "parDelta": 14, "knockouts": 44 },
        { "player": "cunder",      "place": 2, "score": 3320, "holesWon": 8,  "holesDone": 38, "parDelta": 18, "knockouts": 67 },
        { "player": "rogue",       "place": 3, "score": 3270, "holesWon": 5,  "holesDone": 40, "parDelta": 14, "knockouts": 79 },
        { "player": "sandman",     "place": 4, "score": 3260, "holesWon": 8,  "holesDone": 43, "parDelta": 26, "knockouts": 79 },
        { "player": "princegames", "place": 5, "score": 3155, "holesWon": 10, "holesDone": 39, "parDelta": 20, "knockouts": 100 },
        { "player": "toiletduck",  "place": 6, "score": 3105, "holesWon": 1,  "holesDone": 34, "parDelta": 3,  "knockouts": 57 },
        { "player": "matticus",    "place": 7, "score": 2955, "holesWon": 1,  "holesDone": 35, "parDelta": 15, "knockouts": 134 }
      ],
      "note": "Jester's twelve holes won carried it wire to wire. Sandman quietly racked up the most holes finished in the lobby, forty-three, and still only landed fourth. Toilet Duck stayed disciplined off the tee for the best par in the lobby despite finishing near the bottom. Matticus set a new personal high with 134 knockouts and finished dead last for the third time this season, at this point it might just be his brand."
    }
  ]
}
```
