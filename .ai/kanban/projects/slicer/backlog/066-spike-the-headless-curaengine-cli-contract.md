---
id: 66
title: "Spike: the headless CuraEngine CLI contract"
type: spike
priority: P1
effort: M
model: opus
area: [cura]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [65]
created: 2026-10-25
---

Reads `CommandLine.cpp` at the pinned revision and runs fixtures to decide: `-j` with `-e` versus `-r` resolved JSON, which defaults load from definitions, how per-extruder settings are passed, and what the log lines look like.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (spike))

## Acceptance criteria

- [ ] Note and `docs/` page: the chosen invocation, the resolved-JSON shape (`{global, extruder.N, <model>.stl}`) and why, with the CuraEngine revision
- [ ] A hand-built resolved JSON slices the fixture cube with the pinned CuraEngine
- [ ] List of stage log lines ('Starting <stage>...') and the exit codes observed (0, 1, 2, SIGFPE)

## Tasks

- [ ] Read CommandLine.cpp
- [ ] Run both routes
- [ ] Record the contract

## Progress

Not started.
