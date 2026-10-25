---
id: E33
title: Edit objects, parts, modifier volumes and per-object setting overrides
status: reviewed
initiative: I6
project: VWR
order: 6
depends_on: [E32, E9, E52, E54]
rows: ["§3 Move, rotate, scale, lay on face", "§3 Mirror, split, instances, unit conversion, merge", "§3 Modifier and negative volumes, support enforcers and blockers", "§4 Per-object, part and range setting overrides"]
---

The everyday editing tools: move, rotate and scale with gizmos and numeric input, lay on face, mirror, split into objects or parts, instances, unit conversion, merge; adding modifier, negative, support-enforcer and support-blocker volumes; and setting overrides per object, part, modifier and height range. This is what a user needs to prepare a typical plate without another slicer.

## Scope

In (`vsslicer.project` webview and host commands; `@vsslicer/mesh` for split and merge):
- Gizmos on three.js `TransformControls` and a numeric panel; snapping; lay on face through BVH picking of the clicked face. Each tool emits E32 commands.
- Mirror X/Y/Z, split to objects and to parts (connected components in a worker), instances (add, remove, set count), unit conversion (inch, metre), merge objects into one with parts.
- Volume types matching the dialects: part, negative, modifier, support enforcer, support blocker; added from primitives (box, cylinder, sphere) or from a file.
- Settings overrides: object, part and modifier config, and layer-range (height-range) config entries edited from the object tree through a form that shows only the keys the schema allows at that level (E52 per-key scope, as PrusaSlicer 3.0 `overrides_in`). Height ranges here are numeric entries; the interactive height-range tool is E54.
- Written new; the volume-type and config-level semantics follow the dialect layout read in E8.

Out: per-plate settings (E34), arrange (E35), cut and boolean (E53), painting (E52), the height-range gizmo and variable layer height (E54).

## Feature-matrix rows

- §3 Move, rotate, scale, lay on face (P1): done when each tool works by gizmo and by number, undoes, and saves into the transform the Orca CLI reads.
- §3 Mirror, split, instances, unit conversion, merge (P1): done when each operation round-trips through save and the Orca CLI slices the result with the expected object and part counts.
- §3 Modifier and negative volumes, support enforcers and blockers (P1): done when each volume type can be added, transformed and removed, and is written with the subtype the Orca CLI honours (checked in its G-code).
- §4 Per-object, part and range setting overrides (P1): done when overrides at each level are edited, validated against the schema and written to `model_settings.config` and `layer_config_ranges.xml`, and the sliced G-code shows the override (for example a different infill density on one object).

## Acceptance criteria

- [ ] Every command registers with E32's inverse property test.
- [ ] Geometry fixtures: split of a two-shell mesh yields two objects with the original triangle sets; merge then split is identity on triangle sets.
- [ ] Orca CLI oracle in CI: fixtures with a negative volume, a modifier with changed infill, a support blocker, an object override and a layer-range override slice, and the G-code parser (E10) confirms the expected effect per object or layer range.
- [ ] Override form rejects keys not allowed at a level, with the reason; invalid values show the E52 validation message.
- [ ] Gizmo interactions covered in the webview harness (drag, snap, numeric entry, escape cancels without a command).
- [ ] Verified only on fixtures and the Orca CLI (D5).

## Dependencies

- Needs E32 (commands, undo), E9 (BVH, connected components), E52 (schema with per-key override scope), E54 (resolved values to show inherited settings), E10 (parser for the G-code checks).
- Exposes the object, part and volume commands and the override editing model to E34, E35, E52 to E55.

## Risks and spikes

- Whether E52's schema carries the override scope (object, part, range) for every key; the Orca key list does not mark it. Spike with PRF: derive scope from Orca `TabPrintPart`/`TabPrintModel` pages and Prusa `overrides_in`.
- `TransformControls` with very large meshes: drag must move a proxy and commit on release; measured on the 5 M fixture.

## Eng review

- Scope challenge: four rows in one epic is the upper edge. Considered splitting overrides into their own epic; kept together because volumes and overrides share the object tree and the Orca CLI verification harness, and the transform tools are thin over `TransformControls`. If sizing exceeds six sprints at story breakdown, split overrides out first.
- Tests: CLI-sliced fixtures catch subtypes or keys the engine ignores, which round-trip tests alone would miss.
- Blast radius: bad transforms or volume types produce wrong prints, not crashes; the CLI checks are the guard.
- Reversibility: each tool is a command; the editing flag in E32 turns all of it off.
- Changed because of the review: height-range numeric editing kept here (it is the P1 range-override row) and the interactive tool moved to E54 (P2).
