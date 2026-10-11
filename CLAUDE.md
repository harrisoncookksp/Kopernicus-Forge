# Scrap Forge

A Scrap Clicker 2 (SC2) style merge/idle game in ONE file: `index.html` (HTML + CSS + JS, no build, no dependencies).
Open it in a browser to play. Saves live in the browser's localStorage under `scrapforge-v3`.

## Owner preferences (important)
- UI and progression should match Scrap Clicker 2 (research the SC2 fandom wiki when unsure:
  `https://official-scrap-2.fandom.com/api.php?action=parse&page=<Page>&prop=wikitext&format=json`).
- Barrels are ORIGINAL designs in the style of SC2's 400+ barrels — never copy SC2's actual barrels.
  Style: no black outlines, lit left / dark right, no shadows, same size and perspective, shape matched
  to the real object, more detail in later eras, pun names, all different.
- 4 wide x 5 tall board. Empty slots show a faint lighter barrel silhouette.
- #50 is a trophy. Other round numbers are NOT automatically trophies (#100 is a cake, #150 a pedestal).
- Must scale to thousands of tiers: all currencies are stored as log10 numbers.
- The owner wants blunt, critical feedback, not flattery.

## Code map (search these names in index.html)
- Numbers: `LZ` (log zero), `ladd`, `lsub`, `lnum`, `fmtL`, `fmtS`, `fmt`.
- Barrel art: `SHAPE` (body shapes + clip paths), `BOXES`, `barrel(o)`, helpers `star`, `dots`, `tube`, `stripes`, `cubeFace`.
  Shared gradients in the `#defs` insert (`rg-*`, `lg-*`). `ITEMS` = one entry per tier; append new barrels at the end.
  `ERAS` = tier -> era name (toast + board shake).
- State: `fresh()`, `load()`, `save()`, `S`. Prestige keeps fields listed in `prestige()`'s `keep`.
- Formulas: `multL`, `prodL`, `gsMultL`, `pendingL`, `starCostL/starPriceL`, `starUpCost`, `starX`, `starBoostL`,
  `spendReq`, `brickRateL`, `magMult/addMagnets`, `fragGain`, `shinyChance`, `T(id)` (owns tree node).
- Upgrade lists: `UPG` (scrap), `MUPG` (magnets), `BUPG` (bricks), `GUPG` (golden scrap), `TREE` (x40+ Upgrade Tree).
- Systems: Stars (10, then per-star upgrades), Scrapyard v2/v3, Bricks (x15), Star Fragments (double-tap a barrel),
  Steel Beams, Upgrade Tree (x40), Quests (x60, `QTYPES`), Storms, Levels, Shiny barrels + combos (original).
- Loop: `step(dt)`, `render()`, `tick()`.

## Testing
Needs Node + Playwright (`npm i -g playwright && npx playwright install chromium`). Outputs go to `tools/out/` (ignored).
- `node tools/test-ui.cjs`, `node tools/test-endgame.cjs`, `node tools/test-shiny.cjs` — must print `errors []`.
- `node tools/sheet.cjs 141` — contact sheet of 15 barrels from #141 (check art after adding barrels).
- `node tools/sim.cjs 30` — 30-hour headless pacing bot (takes a few minutes). Last result: #140 ~11h, 10th star ~10h, x80 ~29h.

## Workflow
Develop on branch `claude/cloud-local-download-45gbfs`. Commit and push when done.
