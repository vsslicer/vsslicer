---
id: 145
title: Record sliced fixtures of the generated models with the pinned engines
type: chore
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [138, 139, 140, 141, 30, 82]
created: 2026-10-25
---

Slices the 0.1.0 generators' models with the pinned Orca and CuraEngine once and checks in the G-code (sweep not applied) so tests run without an engine.

**Code:** `vsslicer/modules/core/calibration/test/fixtures/` (module: `calibration`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Each fixture has `PROVENANCE.md` with engine version, settings and the model hash; no file exceeds the 5 MB cap
- [ ] A regeneration script exists and documents how to redo it
- [ ] Fixtures per engine exist for the temperature, retraction, volumetric speed and VFA models

## Tasks

- [ ] Slice the models
- [ ] Check in with provenance
- [ ] Regeneration script

## Progress

Not started.
