---
id: 4
title: Feature inventory: Cura and CuraEngine
type: spike
priority: P0
effort: L
area: [slicer]
milestone: R1
created: 2026-10-25
---

Every user-facing feature of Cura and CuraEngine, grounded in `fdmprinter.def.json` and the frontend/plugin code.

Report: `docs/research/features-cura.md`. Notes: `.reference/notes/VSS-4-features-cura.md`.

## Acceptance criteria

- [ ] Every setting category and setting listed from `resources/definitions/fdmprinter.def.json` (and `fdmextruder.def.json`) with type and meaning, grouped by category
- [ ] Model-prep tools inventoried: per-model settings, support blockers/modifier meshes, mesh tools plugin, cut/boolean (or their absence), arrange, variable layer height (adaptive layers), tree supports
- [ ] Plugin system described: built-in plugins (post-processing scripts, marketplace), how plugins extend settings, stages and views
- [ ] Frontend/engine protocol summarised (Arcus/protobuf, settings transfer, layer data back) and multi-extruder handling
- [ ] Features unique to Cura versus the Slic3r family (and vice versa) called out
- [ ] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [ ] Parse `fdmprinter.def.json` with a script into a settings list; keep raw dump in notes
- [ ] Walk `plugins/` and `cura/` for tools
- [ ] Read CuraEngine `src/settings/` and `src/communication/`
- [ ] Write the report

## Progress

Not started.
