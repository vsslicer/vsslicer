---
id: US34
title: "Export a plain 3MF for interchange"
status: reviewed
epic: VSS:E31
---

As a user sharing a model, I want a generic 3MF with no vendor parts, so that lib3mf, three.js, PrusaSlicer and Cura open it with the right objects and positions.

## Acceptance criteria

- [ ] The export contains core model parts only and no vendor `Metadata/` parts; meshes have transforms baked or are build items
- [ ] The export passes lib3mf validation and the 3MF Consortium positive-case checks and loads in three.js `3MFLoader`
- [ ] The manual matrix records that PrusaSlicer and Cura open it with the right objects and positions
- [ ] Verified only on fixtures (D5)

## Out of scope

- Vendor extensions in generic export; the sliced layout
