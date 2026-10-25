---
id: E13
title: Build ProfileStore with resolve and lossless native round-trip export
status: reviewed
initiative: I3
project: PRF
order: 3
depends_on: [E11, E12]
rows: ["§7 Placeholder macro language (`{if}`, expressions)"]
---

`ProfileStore` in `@vsslicer/profiles`: the files on disk, the index over them and `resolve(printerInstance, material[], process) → {unified, native(format)}`, plus writers that export entities back to PrusaSlicer INI, Orca/Bambu JSON and Cura instance containers. This is the API the slicer adapters call to produce engine input (E27, E28) and the one the profile UI edits through (E14-E8). For users it means a profile imported from Orca and edited in VSSlicer slices exactly like the original, and can be exported back to Orca.

## Scope
- In: the store layout. User entities as one JSON file each under the workspace `.vsslicer/profiles/` (tracked by git, which replaces cloud sync), vendor entities under `globalStorageUri`; identity from `id`, never from file names. User entities store only their diff, the parent `id` and the parent `version` (`profiles.md` §6).
- In: the index (by id, kind, vendor, compatibility), file watching, `resolve` (inheritance chain, `overrides` by `when`, per-extruder keys) with a provenance trail per resolved key (which entity set it), and compatibility queries (`compatibleMaterials(printerInstance)`, `compatibleProcesses(...)`).
- In: native export written new: Prusa INI sections (flattened or with one `inherits`, as PrusaSlicer stores user presets), Orca/Bambu JSON (`inherits`, `from`, arrays with `nil`, extruder-variant arrays rebuilt from keyed values), Cura `quality_changes`/`definition_changes` `.inst.cfg` with the current `setting_version` (27). Unmodified entities export their stored native form byte for byte.
- In: placeholder macro text (start, end, layer, toolchange G-code) stored verbatim with a `dialect` tag (`prusa-macro`, `cura-subst`); exported unchanged to the same dialect; a warning when exported to the other dialect, because the languages are not portable (`profiles.md` §6).
- Out: evaluating macros (the engine does, §7 row reason); the placeholder catalogue and template editor (E16); three-way vendor upgrade UI (E57); bundle formats (E18); secrets (E16).

## Feature-matrix rows
- §7 Placeholder macro language (P1): done when start/end/layer/toolchange G-code from every importer survives store, resolve and export byte-exact, and a cross-dialect export warns.

## Acceptance criteria
- [ ] Round trip: for every user preset fixture and a sample of 200 vendor presets per ecosystem, import then export to the same format is byte-equivalent (key order and number formatting kept through the native form).
- [ ] Edit then export: changing one unified key on an imported Orca process produces a native file whose diff to the original is that one key (converted per the catalogue).
- [ ] `resolve` for the E12 tuple fixtures returns the same values as E12's oracle, plus the provenance trail; the H2C 0.4 nozzle + Bambu PLA Basic + 0.20 mm Standard tuple is one of them.
- [ ] Resolving 1 000 times over the full Orca tree index stays under 5 ms per call on CI (cached chains, invalidated by the watcher).
- [ ] A file edited outside VSSlicer (git checkout, text editor) is re-indexed within one second; an invalid file gives a diagnostic and the last valid version stays resolvable.
- [ ] Concurrent writes from two windows on the same workspace do not lose an edit (write via temp file and rename, compare `meta.updated`).
- [ ] Fixtures only (D5); the end-to-end slice of a resolved H2C profile on the printer is SLC's and PRN's test.

## Dependencies
- Needs E11, E12. Coordinated with E27, which consumes this API and defines what the Orca CLI needs as input; that is an interface agreement, not a dependency of this epic.
- Exposes `ProfileStore` (`get`, `list`, `query`, `resolve`, `save`, `export(format)`, `onDidChange`) to E14-E9, E26/E2/E3, E40 (material lookup), E20 (printer instances through E16), E16 (template text and dialect).

## Risks and spikes
- Byte equivalence for vendor presets that are flattened on import (Prusa system presets are stored flattened, `PresetBundle.cpp:1367`): export target is the flattened form, which is what PrusaSlicer itself writes; spike confirms on 10 presets.
- Number formatting (Prusa `0.2` vs `0.20`, Orca strings for numbers): keep the source text in the native form; only edited keys are re-formatted, by the dialect's rules.
- Workspace versus global storage for user entities in multi-root workspaces: first folder wins; recorded as a question for E14.

## Eng review
- Scope: about 3-4 sprints; one deliverable (the store API). Not merged with E12: E12 is pure functions over inputs, E13 owns files and state, and they test differently.
- Tests: round-trip catches formatting and key-order loss; edit-diff catches conversion errors; concurrency test catches lost edits (data loss).
- Blast radius: a store bug can corrupt user profiles. Mitigation: atomic writes, never rewrite an unchanged file, and git in the workspace as the undo log.
- Reversibility: export writes new files and asks before overwriting.
- Zero silent failures: invalid file, unresolved parent, unknown export key, cross-dialect macro each surface as diagnostics through `onDidChange`.

## Coordinator reconciliation

- Expose `ProfileStore.update` (write-back) for the SLC calibration epic, and make `material.external_ids` hold Bambu `filament_id`, Orca ids, Prusa names and Cura GUIDs, searchable, for the FIL spool-to-profile link. Agree the printer_instance interface with the PRN printer-API epic before either depends on the other.
