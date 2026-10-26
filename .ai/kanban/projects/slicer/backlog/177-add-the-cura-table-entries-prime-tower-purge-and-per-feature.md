---
id: 177
title: "Add the Cura table entries: prime tower, purge and per-feature extruders"
type: feature
priority: P2
effort: S
model: sonnet
area: [cura, multimaterial]
story: US54
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [176, 92, 160]
created: 2026-10-25
---

Adds entries for the prime tower, `support_*_extruder_nr`, `adhesion_extruder_nr` and related purge settings.

**Code:** `vsslicer/modules/slicer-cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and the coverage check passes
- [ ] Per-feature entries list the roles they cover
- [ ] Nozzle map keys are `unsupported` with the reason

## Tasks

- [ ] Check the keys against the catalogue
- [ ] Write the entries
- [ ] Run the table validator and coverage check

## Progress

Not started.
