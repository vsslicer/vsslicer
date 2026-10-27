---
id: 297
title: Round-trip layer-height profiles and layer ranges on Orca and PrusaSlicer 2.x fixtures and through conversion
type: chore
priority: P2
effort: M
model: sonnet
area: [3mf]
story: US94
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [83, 24, 26, 93, 274]
created: 2026-10-25
---

Closes the layer-height part of the persistence row: the profile and the ranges survive read, write, conversion from Prusa and save. Any gap the test finds in the reader or writer is fixed in this card.

**Code:** `vsslicer/modules/core/3mf/test/roundtrip/layers/` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [ ] Orca fixture: `layer_heights_profile.txt` and `layer_config_ranges.xml` write back equal; Prusa 2.x fixture reads equal to its golden
- [ ] A converted Prusa project keeps the profile and the ranges in the Bambu/Orca files
- [ ] An untouched project copies the original bytes

## Tasks

- [ ] Round-trip harness
- [ ] Fix gaps
- [ ] Conversion case

## Progress

Not started.
