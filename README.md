# Super Battle Golf League

The official record of our Monday night Super Battle Golf league. Static site, no backend,
hosted on GitHub Pages.

## Quick start

1. Drop this whole folder into a GitHub repo (GitHub Desktop: New Repository, then copy the
   files in).
2. Commit and push.
3. Repo Settings > Pages > Source: Deploy from a branch, `main`, `/ (root)`. Save.
4. Open `https://<your-username>.github.io/<repo-name>/`.

It will not work by double-clicking `index.html` on your desktop, because it loads its data
over the network. Use the Pages URL.

## Logging a Monday

Edit `data/seasons/S1/current.md`. Add a match to the end of the `matches` array, fill in at
least each player's `place` and `score`, update the `updated` date, then commit and push. The
site recalculates everything else (standings, the gold/silver/bronze/green balls, the fun
cards, the champion).

Full field guide and the rules are in `AGENTS.md`.

## How the balls work

- Gold = last Monday's 1st place (current champion)
- Silver = last Monday's 2nd
- Bronze = last Monday's 3rd
- Green = season points leader (most total in-game points all season)

## Player portraits

500x500 images. Put them somewhere like `assets/img/players/`, then point each player's
`avatar` in `data/players.json` at the file. Until then everyone shows a gray placeholder.
