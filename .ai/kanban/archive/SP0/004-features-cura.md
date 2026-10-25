---
id: 4
title: "Feature inventory: Cura and CuraEngine"
type: spike
priority: P0
effort: L
area: [slicer]
milestone: R1
sprint: SP0
owner: worker-opus
created: 2026-10-25
---

Every user-facing feature of Cura and CuraEngine, grounded in `fdmprinter.def.json` and the frontend/plugin code.

Report: `docs/research/features-cura.md`. Notes: `.reference/notes/VSS-4-features-cura.md`.

## Acceptance criteria

- [x] Every setting category and setting listed from `resources/definitions/fdmprinter.def.json` (and `fdmextruder.def.json`) with type and meaning, grouped by category
- [x] Model-prep tools inventoried: per-model settings, support blockers/modifier meshes, mesh tools plugin, cut/boolean (or their absence), arrange, variable layer height (adaptive layers), tree supports
- [x] Plugin system described: built-in plugins (post-processing scripts, marketplace), how plugins extend settings, stages and views
- [x] Frontend/engine protocol summarised (Arcus/protobuf, settings transfer, layer data back) and multi-extruder handling
- [x] Features unique to Cura versus the Slic3r family (and vice versa) called out
- [x] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [x] Parse `fdmprinter.def.json` with a script into a settings list; keep raw dump in notes
- [x] Walk `plugins/` and `cura/` for tools
- [x] Read CuraEngine `src/settings/` and `src/communication/`
- [x] Write the report

## Progress

Done. All 771 settings (740 fdmprinter, 31 fdmextruder) by category with type, unit, flags and line; model-prep tools, plugin system, Arcus/protobuf and gRPC slot protocol, multi-extruder handling, Cura-vs-Slic3r-family feature comparison; Cura 5bea2f8, CuraEngine 47b0388, Uranium e65ccc1. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: no call sites found for the SIMPLIFY_MODIFY and INFILL_MODIFY engine plugin slots.
