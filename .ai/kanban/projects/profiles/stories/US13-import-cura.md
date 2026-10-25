---
id: US13
title: "A user imports Cura definitions, quality profiles and materials"
status: reviewed
epic: VSS:E12
---

A Cura user gets machine definitions, variants, quality files, their own `quality_changes` and the fdm_materials XML as unified entities, with `=expr` formulas preserved.

## Acceptance criteria

- [ ] Golden counts at Cura@5bea2f8: 706 definitions, 544 extruders, 1 741 variants, 6 011 quality files; fdm_materials@0c05969 every XML file to one `material`
- [ ] Cura stack order is proven on a fixture; `=expr` values are stored verbatim
- [ ] A malformed XML file gives a diagnostic and the rest import

## Out of scope

- Cura `intent` files (E57); `.curaprofile` (E18).
