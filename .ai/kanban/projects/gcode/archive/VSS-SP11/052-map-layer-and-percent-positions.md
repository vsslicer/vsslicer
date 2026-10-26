---
id: 52
title: Map layer and percent positions
type: feature
priority: P1
effort: S
model: sonnet
area: [live]
story: US17
milestone: "VSS:M1"
sprint: "VSS:SP11"
depends_on: [50, 16]
created: 2026-10-25
---

For printers that report no offset (Bambu).

## Acceptance criteria

- [x] Layer/percent mapping tests on the `.gcode.3mf` corpus

## Tasks

- [x] Mapping
- [x] Tests

## Progress

Mapping already existed in resolvePosition (layer -> layers[n-1].firstMove, percent -> last move with startTime <= percent*totalTime, GCP-50). Nothing new in src for this card; added corpus tests in test/position-map.test.ts on bambu-studio/h2c-cube.gcode.3mf via loadPlate: layers 1, 2, last map to firstMove, layer past the last throws, percent 0/50/100 land on the right move by start time. Other .gcode.3mf in the corpus: only this one exists in gcode-preview fixtures.
Verified (gcode-preview, macOS): pnpm lint, build clean; pnpm test 125 pass (121 existing + 4 new in test/position-map.test.ts), 0 fail; `node scripts/run.mjs checks` exit 0. CI gate runs on Linux (unverified here).
Mutation probes (each restored): drop the past-end warning -> 1 test fails; `<=` to `<` in the binary search -> fails; layer index off by one -> 2 fail; percent scale /100 -> /50 -> fails.
Release lines: none (tests only).
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-16, which is in SP7.

**Review passed (sp11-rev-gcp-51-52)**
Ran (gcode-preview, macOS): pnpm install, lint, build exit 0; pnpm test 108 tests, 108 pass, 0 fail (the node runner counts 108 here, not the card's 125; position-map.test.ts's 4 tests all ran); `node scripts/run.mjs checks` exit 0. Mutation probes on src/domain/print-position.ts (copy backed up, restored, diff checked): no warning -> 1 fail; warning `>` to `>=` -> 1 fail (exact-last-move case); binary search `<=` to `<` -> 1 fail; layer index off by one -> 2 fail; percent /100 to /50 -> 1 fail; percent target *0.9 -> 1 fail; layer bound +1 -> 1 fail. Layering: domain is pure (only @vsslicer/gcode-api), no cross-module relative imports. No new parsing: the input still goes through parsePosition (u32 bound) unchanged. AC: the corpus test on bambu-studio/h2c-cube.gcode.3mf checks layers 1, 2 and the last against firstMove, a layer past the end throwing RangeError, and percent 0/50/100 by start time (50 brackets the move on both sides). Its startOf only reads moves[0], but a second buffer would make it throw, not pass silently.
