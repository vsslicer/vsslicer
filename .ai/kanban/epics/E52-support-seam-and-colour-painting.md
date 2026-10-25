---
id: E52
title: Paint supports, seams and colours with a TriangleSelector-compatible model
status: draft
initiative: I10
project: VWR
order: 11
depends_on: [E31, E33, E9]
rows: ["§3 Support and seam painting", "§3 Multi-material (colour) painting", "§9 Painting, layer-height, cut and per-layer G-code persistence"]
---

Power users paint where supports go, where seams sit and which filament each face gets. This epic adds those three painting tools and stores the paint in each dialect so that the engines honour it and the upstream GUIs show it.

## Scope

In (`@vsslicer/mesh` painting model; `vsslicer.project` painting tools):
- Painting model compatible with the TriangleSelector serialisation used by PrusaSlicer, Bambu Studio and Orca: a recursive per-triangle subdivision tree with states, serialised as the hex strings stored on `<triangle>` attributes. Ported (D2) from `OrcaSlicer@09aa0114:src/libslic3r/TriangleSelector.cpp` and `.hpp` (AGPL-3.0) with notices; PrusaSlicer's version at `PrusaSlicer@30ef591:src/slic3r-domain/include/Slic3r/Domain/TriangleSelector.hpp` is the cross-check.
- Tools: brush (circle, sphere cursor), bucket fill, smart fill, gap fill, height range, clear; worked on the BVH from E9 with shapecasts; strokes are E32 commands storing only the changed triangle subtrees.
- Rendering: per-triangle state overlay in a custom shader on the three.js `WebGLRenderer`.
- Persistence: Bambu/Orca `paint_supports`, `paint_seam`, `paint_color` attributes through E31's writer; Prusa 2.x `slic3rpe:*` attributes read by E8 are converted on load. Unknown paint attributes (`paint_fuzzy_skin`, `paint_texture_*`, `face_property`) stay preserved.

Out: fuzzy-skin and texture painting (P3, E56); texture-to-colour (P3 in the same row family); the slicing effect itself (the engine applies paint).

## Feature-matrix rows

- §3 Support and seam painting (P2): done when painted enforcers, blockers and seam marks round-trip and the Orca CLI's G-code shows supports and seams where painted.
- §3 Multi-material (colour) painting (P2): done when painted filament regions round-trip and the Orca CLI's G-code changes tool where painted.
- §9 Painting, layer-height, cut and per-layer G-code persistence (P2): done here for paint in every dialect we read and the Bambu/Orca writer. The per-layer G-code part is delivered by E34 and the layer-height and cut parts by E54 and E53, each with its own round-trip criterion; this row is closed when all four pass.

## Acceptance criteria

- [ ] Serialised paint strings from upstream fixtures decode and re-encode byte-identically (Orca, Bambu Studio and PrusaSlicer 2.9 fixtures).
- [ ] A fixture painted in VSSlicer opens in Orca with the same painted regions (manual matrix) and slices with the Orca CLI with supports, seams and tool changes in the painted regions (checked with E10 per layer).
- [ ] Each stroke is undoable; E32's inverse property test covers paint commands.
- [ ] Painting a 1 M triangle mesh keeps interaction within the frame budget set in E10.
- [ ] Verified only on fixtures (D5); a painted multi-colour print on the H2C is an optional manual check.

## Dependencies

- Needs E9 (BVH), E31 (writer), E33 (objects and parts), E10 (G-code checks), E26 (Orca CLI).
- Exposes the `PaintLayer` model and serialiser to E53 (cut must split paint) and SLC (§5 multi-material UI shows painted filaments).

## Risks and spikes

- Subdivision depth and memory on dense meshes; measured on the 1 M fixture.
- Prusa 3.0 stores paint in `Slic3r_facets_annotation.json`; handled when the Prusa 3.0 reader exists.

## Eng review

- Scope challenge: the two painting rows share one model and tool set, so one epic. The persistence row sits here because paint is its first and largest part; its other parts are named in E34, E53 and E54.
- Tests: byte-identical decode and encode against upstream strings is the strongest oracle for a ported format.
- Blast radius: bad paint produces wrong supports or colours; CLI checks catch it before users do.
- Reversibility: paint layers can be cleared per object; files keep valid 3MF.
- Changed because of the review: preserved unknown paint attributes instead of dropping them.
