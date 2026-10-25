---
id: E56
title: "Deferred P3 rows: model tools, extra formats and mesh export"
status: draft
initiative: I10
project: VWR
order: 15
depends_on: []
rows: ["§3 Simplify (decimation)", "§3 Fuzzy-skin painting", "§3 Texture displacement", "§3 Text emboss", "§3 SVG emboss", "§3 Assembly view, alignment", "§3 Shapes, gallery, generators", "§3 Image to heightmap or lithophane", "§3 Model checker (warp risk)", "§3 Import AMF, SVG, ZIP and other formats", "§4 SMT sequential arrange", "§7 Export meshes to STL or Draco (.drc)", "§9 Universal Cura Project (.ucp)"]
---

The P3 rows the viewer project owns. None has an epic of its own; each waits for an owner decision. Where a row is cheap once an earlier epic exists, that is noted so the decision is quick.

## Scope

Nothing is built under this epic. Unknown parts that carry these features (for example, `paint_fuzzy_skin`, `paint_texture_*`, emboss shapes in `3D/*.svg`, `assembly_*.json`, Orca `texture_displacement/`) are preserved byte-for-byte by E8 and E31, so files from other slicers keep them.

## Feature-matrix rows

- §3 Simplify (P3): rare need; meshoptimizer (MIT) would make it small once wanted.
- §3 Fuzzy-skin painting (P3): niche; adds one state to the E52 painting model.
- §3 Texture displacement (P3): Orca-only; preserved, not edited.
- §3 Text emboss (P3): nice to have; needs font outlines and E53's boolean.
- §3 SVG emboss (P3): nice to have; as text emboss.
- §3 Assembly view, alignment (P3): niche Bambu feature; preserved.
- §3 Shapes, gallery, generators (P3): calibration models need only a few shapes, which SLC's calibration epic can generate.
- §3 Image to heightmap or lithophane (P3): niche Cura feature.
- §3 Model checker (warp risk) (P3): niche Cura feature.
- §3 Import AMF, SVG, ZIP and other formats (P3): rare; AMF was dropped by PrusaSlicer 3.0.
- §4 SMT sequential arrange (P3): disabled upstream at PrusaSlicer 3.0-alpha12 (needs z3).
- §7 Export meshes to STL or Draco (P3): rare; STL export is a few lines on E9 once asked for.
- §9 Universal Cura Project (P3): skipped; E8 detects a UCP and opens it as a Cura workspace.

## Acceptance criteria

- [ ] An owner decision reopens a row.

## Dependencies

None until a row is reopened; each note above names the epic it would extend.

## Risks and spikes

None.

## Eng review

Scope challenge: every P3 row of §3, §4, §7 (mesh export) and §9 owned by VWR is listed once. Preservation by E8 and E31 is the only commitment, and it is already tested there.
