---
id: 126
title: "Split per-nozzle Orca printer presets into printer_model, nozzle and overrides"
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [27, 135]
created: 2026-10-25
---

Orca/Bambu machines that exist once per nozzle size become one `printer_model` with `nozzle` entities and `overrides`.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/split/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] An Orca 0.2/0.4/0.6 printer fixture becomes one `printer_model` and three `nozzle` entities; resolving model plus nozzle equals the original machine preset values
- [x] The native form of each original preset stays attached

## Tasks

- [x] Detect nozzle variants
- [x] Extract overrides
- [x] Tests

## Progress

Not started.

**2026-10-26, sp10-prf-126:** `splitOrcaPrinters(tree: OrcaTree): ImportResult` in `src/adapters/split/split.ts`, exported from `src/index.ts`, CHANGELOG line under Unreleased.
- Same shape as profiles-prusa `splitVariants`: a non-abstract `machine` preset with `printer_model` naming a `machine_model` of the same vendor and a non-empty `printer_variant` becomes a `nozzle` (id = preset name, diameter = `nozzle_diameter[0]`); the model gets the settings all its variants share, one `overrides` block per nozzle (`when: nozzle.id == '...'`) with the rest, and `nozzles`. Grouping per OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:3881-3885 and :4504-4514 (AGPL-3.0). Bed (`printable_area`, array or comma string per Config.hpp:1619-1640) and nozzle count come from the model's first preset; a preset with another bed or count, no model or no variant stays a standalone `printer_model` (info diagnostic for a mismatch). Abstract machines are skipped (already flattened into children); a `machine_model` with no preset is reported (info) and not emitted.
- `native` keys every entity id (nozzle, standalone printer, model) to its source `OrcaPreset`.
- Settings stay Orca keys with native values (Orca names are the unified keys); value conversion is left to the Orca importer. Multi-extruder presets become one nozzle from extruder 0 (shortcut comment, as in Prusa).
- Bounds: input is an `OrcaTree`, already capped by `TREE_LIMITS`; work is linear in presets x keys, no new parsing beyond splitting `printable_area` (bounded by file size).
- Real trees (scratch probe): Orca@09aa0114 -> 451 models, 1156 nozzles, 28 standalone (27 upstream bed/count mismatches, e.g. Artillery M1 Pro 0.4 has a round bed, 1 with no nozzle diameter), 2 empty models. BambuStudio -> 92 models, 202 nozzles, no diagnostics.
- Tests `test/split.test.ts` (3): 0.2/0.4/0.6 fixture -> one model + three nozzles, `applyOverrides(model, {nozzle:{id}})` equals each preset's flattened settings, native attached; standalone cases (other bed, empty variant, unknown model) plus comma-string bed; unusable bed dropped with warning and empty model reported.
- Mutation probes (each made a test fail, then restored): common keeps all keys; no comma-string split; no bed check; no `native` for presets; no `native` for models; no bad-bed warning; no empty-model report.
- Checks: `pnpm install`, `pnpm lint`, `pnpm build` pass; `pnpm test` 8 files, 92 tests pass; `node scripts/run.mjs checks` passes (84/84, licence, fixtures).
