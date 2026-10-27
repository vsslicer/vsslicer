---
id: 173
title: "Add the Orca table entries: tower, purge, per-feature filament and nozzle map"
type: feature
priority: P2
effort: S
model: sonnet
area: [orca, multimaterial]
story: US54
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [172, 92, 160]
created: 2026-10-25
---

Adds entries for `wipe_tower_type`, tower position and size, ramming, `flush_into_*`, the `*_filament_id` keys, `filament_map` and `filament_map_mode`.

**Code:** `vsslicer/modules/slicer/orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and the coverage check passes
- [ ] Per-feature keys list the roles they cover
- [ ] Dual-nozzle keys are marked with the printers that honour them

## Tasks

- [ ] Check the keys against the catalogue
- [ ] Write the entries
- [ ] Run the table validator and coverage check

## Progress

Not started.
