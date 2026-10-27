---
id: 273
title: "Capture the paint fixtures: upstream projects with painted supports, seams and colours, and Orca's fill results"
type: chore
priority: P2
effort: M
model: sonnet
area: [mesh, painting]
story: US80
milestone: "VSS:M5"
sprint: "VSS:SP44"
created: 2026-10-25
---

The oracle for the painting model: projects saved by the upstream GUIs with paint, so the codec and the fills are checked against what they write. Shared by `mesh`, `3mf` and `project-extension`.

**Code:** `vsslicer/fixtures/paint/` (layer: n/a (fixtures))

## Acceptance criteria

- [ ] One small project each from Orca, Bambu Studio and PrusaSlicer 2.9 with `paint_supports`/`paint_seam`/`paint_color` (Prusa: `slic3rpe:custom_supports`/`custom_seam`/`mmu_segmentation`), including a deeply subdivided triangle and more than four filaments
- [ ] One Orca project also carries an unknown paint attribute (`paint_fuzzy_skin`) and a `face_property`
- [ ] For three fixture meshes Orca's bucket fill, smart fill (30 degrees) and gap fill results are recorded as selected-triangle sets from the GUI
- [ ] App name, version and how each file was made are in a README; each file is under 5 MB

## Tasks

- [ ] Paint in the three GUIs
- [ ] Save and extract the strings
- [ ] Record the fill results
- [ ] README

## Progress

Not started.
