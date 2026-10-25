---
id: US3
title: "Tessellate G2/G3 arcs within chord tolerance"
status: reviewed
epic: VSS:E3
---

As a user previewing arc-fitted files, I want G2/G3 arcs drawn as smooth curves, so Orca and PrusaSlicer arc output looks like the print and nothing downstream has to handle arcs.

## Acceptance criteria

- [ ] I/J and R forms, full circles, negative R and planes G17-G19 tessellate correctly
- [ ] Arc-fitted fixtures from PrusaSlicer and Orca are within 0.05 mm chord tolerance and R resolves to the same centre as I/J
- [ ] An inconsistent radius gives a diagnostic and a straight move
- [ ] Each segment is flagged with its source arc

## Out of scope

- Per-firmware arc segmentation for timing (E4)
