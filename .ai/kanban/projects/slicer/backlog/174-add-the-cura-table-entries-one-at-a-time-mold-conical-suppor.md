---
id: 174
title: "Add the Cura table entries: one-at-a-time, mold, conical support and gradual infill"
type: feature
priority: P2
effort: S
model: sonnet
area: [cura]
story: US59
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [97, 92, 159]
created: 2026-10-25
---

Adds entries for `print_sequence` (`one_at_a_time`), `mold_*`, `support_conical_*` and `gradual_infill_*`, and `unsupported` entries for overhang printing and bed mesh.

**Code:** `vsslicer/modules/slicer/cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and the coverage check passes
- [ ] Every entry names the Cura setting and its engine version range
- [ ] Settings resolved by `cura-settings` are read, not copied

## Tasks

- [ ] Check the keys against the catalogue
- [ ] Write the entries
- [ ] Run the table validator and coverage check

## Progress

Not started.
