---
id: 170
title: "Add the Orca table entries: sequential, overhang and bed mesh"
type: feature
priority: P2
effort: S
model: sonnet
area: [orca]
story: US59
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [93, 92, 159]
created: 2026-10-25
---

Adds entries for `print_sequence`, `make_overhang_printable*` and `bed_mesh_*`, and `unsupported` entries for mold, conical support and gradual infill, to the Orca capability table.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates against the schema and the coverage check passes (no unreviewed entry)
- [ ] Every entry names the Orca key and the pinned version range
- [ ] A set key with an `unsupported` entry produces the warning of US27

## Tasks

- [ ] Check the keys against the catalogue
- [ ] Write the entries
- [ ] Run the table validator and coverage check

## Progress

Not started.
