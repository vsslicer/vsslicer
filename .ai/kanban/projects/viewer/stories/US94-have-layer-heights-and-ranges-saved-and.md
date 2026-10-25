---
id: US94
title: "Have layer heights and ranges saved and followed by the engine"
status: reviewed
epic: VSS:E54
---

As a user, I want my layer-height profile and ranges to be saved in the project, to open in Orca and PrusaSlicer, and to be honoured when I slice, so that what I edit is what prints.

## Acceptance criteria

- [ ] Profile and ranges round-trip with Orca and PrusaSlicer 2.x fixtures and through conversion (the layer-height part of the §9 persistence row)
- [ ] Layer Z values in the Orca CLI's G-code match the saved profile; a range's override appears only in its layers
- [ ] The spike states which CLI modes honour the files, and the editor warns when a profile and a range layer height conflict
- [ ] Orca and PrusaSlicer open the saved files (manual matrix)
- [ ] Verified only on fixtures (D5)

## Out of scope

- Cura layer settings
