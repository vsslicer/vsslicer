---
id: US84
title: "Keep paint when I save, reopen and convert a project"
status: reviewed
epic: VSS:E52
---

As a user, I want my painting to be saved in the project, to open in Orca, and to survive loading, repair, splitting and conversion, so that I never lose or misplace paint.

## Acceptance criteria

- [ ] A fixture painted in VSSlicer opens in Orca with the same painted regions (manual matrix) and in VSSlicer again with equal layers
- [ ] Bambu/Orca `paint_supports`, `paint_seam` and `paint_color` are written through the writer; PrusaSlicer 2.x `slic3rpe:*` attributes are read and converted on load and on conversion
- [ ] Unknown paint attributes (`paint_fuzzy_skin`, `paint_texture_*`, `face_property`) are preserved
- [ ] Paint stays on the same geometry through repair on load, split and merge
- [ ] Sliced with the Orca CLI, the G-code shows supports, seams and tool changes in the painted regions (checked per layer with the G-code parser) (§3 Support and seam painting, §3 Multi-material (colour) painting)
- [ ] The paint part of the §9 persistence row is closed here for every dialect we read and the Bambu/Orca writer; the layer-height, cut and per-layer G-code parts are closed by US94, US89 and the plates stories
- [ ] Verified only on fixtures (D5)

## Out of scope

- Prusa 3.0 `Slic3r_facets_annotation.json` (handled when the Prusa 3.0 reader exists)
