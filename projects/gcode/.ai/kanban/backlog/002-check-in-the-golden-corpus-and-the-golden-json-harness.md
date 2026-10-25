---
id: 2
title: Check in the golden corpus and the golden-JSON harness
type: chore
priority: P0
effort: L
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [1]
created: 2026-10-25
---

The fixtures and oracle every parser, planner and renderer test uses.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Calibration cube and a multi-material sample from PrusaSlicer, SuperSlicer, Orca, Bambu Studio and Cura, arc fitting on and off where available, are checked in with generating slicer and version recorded in a manifest
- [ ] A harness writes and compares golden JSON per file (move count, layer count, role histogram, labels, thumbnails, summary); a vitest run fails on a difference
- [ ] One `.gcode.3mf` sliced for the H2C in Bambu Studio is in the corpus (version recorded)
- [ ] A PrusaSlicer `.bgcode` and `.gcode` twin pair is present

## Tasks

- [ ] Slice the fixtures with the installed slicers (ask on the board with `board.py ask` if a slicer is missing)
- [ ] Keep files small; use the fixture storage PLT sets up
- [ ] Write the manifest and the golden harness
- [ ] Add a script to regenerate goldens

## Progress

Not started.
