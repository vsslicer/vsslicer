---
id: 93
title: Check the golden corpus parses to the same statistics in the Web Worker
type: chore
priority: P2
effort: M
model: sonnet
area: [web]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [90, 92, 82, GCP-2]
created: 2026-10-25
---

Runs the golden corpus through the Web Worker in headless Chromium and compares the summary statistics with the golden JSON used on desktop.

**Code:** `vsslicer/modules/gcode-parser/test/web/` (module: `gcode-parser`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] Every corpus file gives the same summary statistics (counts, layers, filament, time estimate fields) in the web worker as the golden values the desktop run checks (same data files)
- [ ] A deliberately altered golden value fails the web run (meta-check)

## Tasks

- [ ] Harness
- [ ] Compare
- [ ] Meta-check

## Progress

Not started.
