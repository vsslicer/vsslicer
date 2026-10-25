---
id: E63
title: Add the multi-material UI for towers, flush volumes, purge targets and filament assignment
status: draft
initiative: I10
project: SLC
order: 7
depends_on: [E27, E30, E11, E13, E10, E34]
rows: ["§5 Wipe tower, ramming, purge matrix", "§5 Flush volumes derived from colours", "§5 Purge into infill, objects or support", "§5 Per-feature filament assignment", "§5 Dual-nozzle filament grouping"]
---

Until this epic, multi-material settings pass through from imported profiles unchanged (feature matrix §5). Here VSSlicer gets its own editing for them: wipe or prime tower type and placement, a flush-volume matrix computed from filament colours, purge into infill, objects or support, per-feature filament assignment, and filament-to-nozzle grouping on dual-nozzle printers. It is for AMS and MMU users, starting with the owner's H2C.

## Scope

In:
- A plate-level multi-material panel in `vsslicer.slicer` (webview using `@vsslicer/webview-kit`), reading and writing plate and profile settings through `ProfileStore` and `ProjectModel`.
- Flush matrix from colours: port of Orca's `FlushVolCalc` (`OrcaSlicer@09aa0114:src/libslic3r/FlushVolCalc.cpp`, AGPL-3.0, D2) with a provenance line; 20000 mm³ cap; multiplier; recalculation on filament or colour change. Placeholder names in `change_filament_gcode` are kept unchanged (BO Implications).
- Tower settings: `wipe_tower_type` (Type 1, Type 2), position and size; placement is shown and dragged in the plate view through a `vsslicer.project` overlay API (VWR).
- Purge targets: `flush_into_infill`, `flush_into_objects`, `flush_into_support` per object.
- Per-feature filament assignment: Orca `*_filament_id` keys, Cura support and adhesion extruder settings via the E30 capability table.
- Dual-nozzle grouping: `filament_map` and `filament_map_mode` per plate, manual or automatic.

Out: the engine's tower generation (engine side), AMS slot mapping at send (PRN), multi-material painting (VWR), multi-tool presets (PRF).

## Feature-matrix rows

- §5 Wipe tower, ramming, purge matrix (P2): done when tower type, position and ramming settings are editable and the G-code tower lands where shown (checked by the parser's tower role bounding box).
- §5 Flush volumes derived from colours (P2): done when our matrix equals Orca's for fixture colour sets.
- §5 Purge into infill, objects or support (P2): done when toggles round trip and purge moves appear in the chosen role.
- §5 Per-feature filament assignment (P2): done when assigned features print with the chosen tool in G-code for both engines that support it.
- §5 Dual-nozzle filament grouping (P2): done when a manual map is honoured in the G-code tool changes and the automatic mode matches Orca's grouping on fixtures.

## Acceptance criteria

- [ ] Flush matrix unit tests against values computed by the pinned Orca for fixture colour sets (oracle: Orca's own `project_settings.config` after recalculation)
- [ ] Tower placement: the tower role's bounding box in the parsed G-code is within 1 mm of the placed position
- [ ] Per-feature assignment: tool numbers per role in the parsed G-code match the assignment, Orca and CuraEngine
- [ ] Settings round trip through the plate 3MF (`@vsslicer/3mf`) without loss
- [ ] On the H2C (firmware recorded): one two-colour plate with a manual nozzle map prints with the expected tool changes; other multi-tool setups are fixtures only (D5)

## Dependencies

- Needs E27 (emission), E30 (capability table for per-feature keys), E11 and E13 (keys and writes), E10 (`ProjectModel`), and E34 (VWR's plate epic), which provides the tower placement overlay API.
- Exposes the flush matrix calculator to PRN (send-time remapping may need recalculated flush volumes when AMS mapping changes colours).

## Risks and spikes

- Spike: what the H2C's nozzle arrangement means for `filament_map` (unverified; the H2C class and its nozzle count must be confirmed on the printer and in Orca's machine profile).
- Risk: if E34's overlay API lands late, placement is numeric only until it does.
- Risk: Bambu and Orca flush behaviour drift (900 versus 20000 mm³ cap); the cap follows the selected engine.

## Eng review

- Scope challenge: the five §5 rows share one panel and one data path (plate settings); separate epics would each be under two sprints. One epic, about four sprints.
- Dual-nozzle grouping may need to move earlier if I5 printing on the H2C shows the engine's automatic grouping is wrong; recorded as an open question.
- Blast radius: a wrong flush volume wastes filament or mixes colours, not a crash; the colour-set oracle tests guard it.
- Reversibility: the panel only edits settings that already pass through; disabling it returns to imported values.
