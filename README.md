# Gilded Hour — A Lamplight Heist

[![make.fun competition](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![make.fun rank](https://make.fun/badge/best-heist-game-20261122-0559/baguspriyoariwibowo07-sketch/gilded-hour-heist/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![make.fun reward](https://make.fun/badge/best-heist-game-20261122-0559/baguspriyoariwibowo07-sketch/gilded-hour-heist/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

**Gilded Hour** is an original top-down 2D heist game that runs offline in a
desktop browser from static files. You are the thief: slip through five named
heists in lamplight and moonlight, read the guards' sweeping vision cones,
dodge the wall cameras, crack the vault, lift the signature loot and vanish
out the green exit before the alarm hits 100%.

## The five heists

| # | Heist | Signature loot | Guards | Cameras | Treasures |
|---|-------|---------------|--------|---------|-----------|
| 1 | The Brass Lantern Gallery | Sunfire Opal | 3 | 2 | 6 |
| 2 | Alder Bank Moon Vault | Ember Diamond | 4 | 2 | 8 |
| 3 | The Gilded Conservatory | Songbird Locket | 4 | 3 | 7 |
| 4 | Harbourmaster's Strongroom | Tidegold Compass | 5 | 3 | 9 |
| 5 | The Ivory Athenaeum | Gilded Quill | 5 | 3 | 10 |

**Totals: 21 guards, 13 cameras, 40 treasures, 3 gadgets.**

## How to play

- **WASD / arrows** — move. **Shift** — sneak (slower, harder to spot).
- **E** — pick up loot; hold **E** at the vault to crack it.
- **1** — Smoke Vial (blinds every cone for 4s). **2 + click** — Coin Toss
  (guards investigate the clink). **3** — Lockpick (vault cracks faster).
- Guards go **patrol → suspicious → alert**; cameras feed the alarm meter.
  Walls and furniture block line of sight — cover is real cover.
- Win a heist by stealing its signature loot, then reaching the green exit.
  Lose it by getting caught, or by letting the alarm reach 100%.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `game/index.html` plus its ES modules under
`game/src/`, WebAudio bleeps generated in code, no external assets.

## Layout

- `game/index.html` — page and canvas
- `game/src/main.js` — state, loop and rules
- `game/src/heists.js` — the five heists: rooms, patrols, loot
- `game/src/guards.js` — patrols, vision cones, suspicion
- `game/src/cameras.js` — sweeping wall cameras
- `game/src/render.js` — canvas drawing, HUD and screens
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — WebAudio bleeps
- `game/src/shots.js` — deterministic screenshot states (`?shot=`)
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json`

An entry for the [make.fun best heist game bounty](https://make.fun/c/best-heist-game-20261122-0559).
