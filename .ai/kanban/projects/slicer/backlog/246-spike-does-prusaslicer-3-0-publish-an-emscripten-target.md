---
id: 246
title: "Spike: does PrusaSlicer 3.0 publish an Emscripten target"
type: spike
priority: P3
effort: S
model: opus
area: [embedded]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [243, 218]
created: 2026-10-25
---

Checks whether Prusa publishes a WASM build or target for 3.0; if so, measures it like EM2, otherwise records that it does not exist.

**Code:** `vsslicer/modules/slicer-embedded/` (module: `slicer-embedded`, layer: n/a (spike))

## Acceptance criteria

- [ ] A note with the evidence (repository paths, release assets, date)
- [ ] If a target exists: size, time and memory on the fixtures
- [ ] The candidate is marked in or out for EM6

## Tasks

- [ ] Search upstream
- [ ] Measure if present

## Progress

Not started.
