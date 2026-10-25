---
id: US67
title: "Open a STEP file in the viewer"
status: reviewed
epic: VSS:E37
---

As a user who designs in CAD, I want to open a `.step` or `.stp` file in VS Code and see it tessellated, so that I can check it before preparing a print.

## Acceptance criteria

- [ ] `.step` and `.stp` files open in the viewer; each solid is shown with its STEP product name
- [ ] The STEP fixtures (single solid, assembly with several solids, AP203 and AP214, curved faces) import with solid counts and volumes within 0.5 percent of PrusaSlicer's import of the same files (PrusaSlicer release recorded)
- [ ] The tessellated mesh goes through load-time repair and the mesh statistics
- [ ] Verified only on fixtures (D5)

## Out of scope

- IGES and other CAD formats; live CAD tracking
