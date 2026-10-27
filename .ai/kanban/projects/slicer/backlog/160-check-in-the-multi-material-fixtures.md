---
id: 160
title: Check in the multi-material fixtures
type: chore
priority: P2
effort: M
model: sonnet
area: [engine, multimaterial]
story: US54
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [1, PLT-13]
created: 2026-10-25
---

Two- and four-filament plates with their colour sets, a dual-nozzle H2C-style plate, and hand-written presets with wipe tower, purge and `filament_map` settings.

**Code:** `vsslicer/fixtures/slicer/multimaterial/` (layer: n/a (fixtures))

## Acceptance criteria

- [ ] Each folder has `PROVENANCE.md`; PLT-13 passes
- [ ] `colours.json` lists the filament colour sets used by the flush tests
- [ ] `expected.json` lists tool numbers per role and the expected tower position for each plate

## Tasks

- [ ] Create plates
- [ ] Write presets
- [ ] Write `expected.json` and `PROVENANCE.md`

## Progress

Not started.
