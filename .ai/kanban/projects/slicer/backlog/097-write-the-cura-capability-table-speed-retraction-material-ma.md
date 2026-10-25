---
id: 97
title: "Write the Cura capability table: speed, retraction, material, machine and the rest"
type: feature
priority: P1
effort: L
model: opus
area: [cura, engine]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [96]
created: 2026-10-25
---

The remaining groups, so the whole table covers every unified key.

**Code:** `vsslicer/modules/slicer-cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] The table covers every key in PRF's catalogue and validates; no unreviewed entries
- [ ] Keys Cura models per extruder are marked with their scope
- [ ] `capabilities()` is wired into `CuraEngine`

## Tasks

- [ ] Map the remaining groups
- [ ] Wire capabilities()
- [ ] Coverage test

## Progress

Not started.
