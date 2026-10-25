---
id: US2
title: "Replace, add and remove parts and save a package untouched"
status: reviewed
epic: VSS:E8
---

As the owner of a sliced-output feature, I want to add, replace or remove named parts of a package and save it, and to save an unchanged package byte for byte, so that a `.gcode.3mf` can be assembled and a project is never altered by merely opening it.

## Acceptance criteria

- [ ] Open then save of an untouched package yields identical bytes per part, relationship and content type (reuses original compressed entries, no recompression)
- [ ] `replacePart`, `addPart` and `removePart` leave every other part byte-identical, and keep `[Content_Types].xml` and relationships consistent
- [ ] The raw-entry copy approach (fflate or a local-header copier) is chosen by spike and recorded
- [ ] Verified only on fixtures (D5)

## Out of scope

- The model writer and dialect writers (E31)
- Re-compressing or re-ordering parts
