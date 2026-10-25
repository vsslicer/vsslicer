---
id: 1
title: "Check in the shared slicer fixtures: models, H2C plates and hand-written presets"
type: chore
priority: P0
effort: M
model: sonnet
area: [engine]
story: US7
milestone: "VSS:M3"
depends_on: [PLT-13]
created: 2026-10-25
---

Small models and plates every SLC module slices in CI and in effect tests: a cube, an overhang, a curved shape for adaptive layers, a bridge-over-infill shape, a two-part two-extruder plate, an H2C Bambu 3MF plate set, and hand-written Orca machine/process/filament presets for the H2C.

**Code:** `vsslicer/fixtures/slicer/` (layer: n/a (fixtures))

## Acceptance criteria

- [ ] Each fixture folder has `PROVENANCE.md` (generator, version, settings, licence) and no file exceeds the 5 MB cap (PLT-13 check passes)
- [ ] `expected.json` per plate lists layer count and roles that a hand check of the first slice confirms; Orca version used is recorded
- [ ] The H2C plate is exported from the installed Orca on the owner's machine (Orca version and date recorded, D5)
- [ ] Hand-written H2C presets load in the installed Orca with `--load-settings` without error

## Tasks

- [ ] Create fixture models (STL) and the plate 3MFs
- [ ] Write the presets
- [ ] Write `expected.json` and `PROVENANCE.md`

## Progress

Not started.
