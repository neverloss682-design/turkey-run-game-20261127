# Turkey Run — The Great Thanksgiving Escape

[![make.fun](https://img.shields.io/badge/make.fun-turkey--run--game--01-orange)](https://make.fun/c/turkey-run-game-01)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Game: offline](https://img.shields.io/badge/game-offline%20static-green)](./game/index.html)

Tom the turkey is on the run. Thanksgiving is coming, Farmer Bram wants him
for dinner, the oven is hot and the carving knives are falling. Grab corn to
unlock the gate, dash past the farmer, hide in the bushes and haystacks, and
escape through three stages — the farmyard, the barn, and the kitchen — before
your three lives run out.

## How to play

- **WASD / arrow keys** — waddle around
- **Space** — dash (or click to dash toward the mouse)
- **Bushes & haystacks** — stand still inside one to hide; the farmer loses your trail
- **Corn** — eat it to unlock the escape gate (4–5 per stage, +100 points each)
- **Golden wing** — fast feet + instant dash refresh for 8 seconds
- **Pie shield** — blocks one hit
- **Oven tiles & falling carving knives** — one hit costs a life; the farmer
  patrols, chases when he spots you, searches where he last saw you, and
  sprints when he has you cornered

Escape all three stages to win. Get caught three times and you are dinner.

## Run it

No build step, no network. Serve the `game/` folder with any static server,
or open it directly:

```sh
cd game
python3 -m http.server 8080
# open http://localhost:8080/
```

Screenshots are posed with `?shot=title|play|chase|end` for the camera; normal
play starts on the title screen with no query string.

## Structure

- `game/main.js` — boot, game loop and state machine
- `game/turkey.js` — the player: movement, dash, hiding, lives, power-ups
- `game/farmer.js` — Farmer Bram's patrol / chase / search / corner AI
- `game/obstacles.js` — corn, power-ups, oven heat, falling carving knives
- `game/levels.js` — the three stage layouts (farmyard, barn, kitchen)
- `game/render.js` — all canvas art: turkey, farmer, oven, knives, HUD, screens
- `game/input.js` — keyboard + mouse
- `game/audio.js` — WebAudio sound effects (no audio files)
- `game/shots.js` — deterministic screenshot poses
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json`

All art and sound are original and drawn / synthesised in code. Built for the
make.fun **turkey-run-game-01** bounty.
