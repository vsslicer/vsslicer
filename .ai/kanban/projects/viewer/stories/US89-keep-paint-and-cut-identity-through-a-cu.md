---
id: US89
title: "Keep paint and cut identity through a cut and open the result in Orca"
status: reviewed
epic: VSS:E53
---

As a user, I want my paint to follow the geometry through a cut or boolean and the cut parts to be recognised by Orca, so that cut projects move between the tools.

## Acceptance criteria

- [ ] Paint is split with the mesh: the painted area per state on the parts matches the original within one split level
- [ ] `cut_information.xml` and connector volume metadata round-trip through the writer and reader
- [ ] Cut parts and connectors are recognised in Orca (manual matrix) (the cut part of the §9 persistence row)
- [ ] Undo restores the original layers
- [ ] Verified only on fixtures (D5)

## Out of scope

- Other persistence parts (US84, US94)
