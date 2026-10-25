---
id: US57
title: "Trust plates in Orca, Bambu Studio and on the H2C"
status: reviewed
epic: VSS:E34
---

As a user, I want a saved multi-plate project to slice per plate and open in the other slicers with plates, names, locks and layer entries intact, so that VSSlicer does not lock me in.

## Acceptance criteria

- [ ] A three-plate fixture with per-plate bed type and a pause slices with the Orca CLI and the pause is found on the right layer of the right plate only
- [ ] Manual matrix: plates, names, lock flags and per-layer entries survive in the Orca and Bambu Studio GUIs
- [ ] On the H2C a two-plate project with a colour change on plate 2, sliced by the Orca CLI, prints plate 2 with the change at the right layer (firmware version recorded); other printers: fixtures only (D5)

## Out of scope

- Printers other than the H2C
