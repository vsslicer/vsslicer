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

**Review failed (sp10-rev-prf-126)**
- Ran in `profiles-orca`: `pnpm install`, `pnpm lint` (eslint, prettier, tsc) and `pnpm build` pass; `pnpm test` 8 files, 97 tests pass (includes PRF-28/29 work in progress). `node scripts/run.mjs checks` exits 1, but only on repo-wide registry drift (every module's lockfile pins `@vsslicer/tooling@0.8.4`, current 0.8.5), not this card.
- Real-tree recount (scratch vitest probe, `loadProfileTree` + `readOrcaTree` + `splitOrcaPrinters`, removed afterwards): OrcaSlicer@09aa0114 has 1184 instantiable machines and 453 machine_models -> 451 models, 1156 nozzles, 28 standalone (27 info for bed/count, 1 warning for no diameter), 2 empty models (info); BambuStudio@79df7ae -> 92 models, 202 nozzles, 0 diagnostics. That matches the card. Duplicate entity ids: 0. `applyOverrides(model, {nozzle:{id}})` deep-equals the source preset's settings for all 1358 nozzles.
- Upstream quotes match (Preset.cpp:3878-3887, :4504-4516, Config.hpp:1619-1640). Layering is fine: adapters only, profile-api plus node:util, no cross-module relative imports.
- Mutation probes on a temp copy, `test/split.test.ts`: killed: bed check, abstract skip, family, keep-all-in-common, variant check. **Survived:** quote escaping in `nozzleIs`, the no-diameter branch, the vendor in the model key, the toolhead-count check.

Problems:
1. `src/adapters/split/split.ts:54,87,107,122,125`: a preset or model named `__proto__`, or a settings key `__proto__`, is assigned onto a plain object. Probe: machine presets `__proto__` (0.4) and `M 0.6` under model `M`. `readOrcaTree` accepts it with no diagnostics, `splitOrcaPrinters` emits the entity, `Object.hasOwn(r.native, '__proto__')` is false, and `native`'s prototype becomes the preset. The native form is no longer attached (the second criterion) and `native` inherits the preset's fields. A `__proto__` settings key would leave `common` the same way and break the round-trip. Fix: untrusted names must never be plain-object keys. Use `Object.create(null)` for `native` and `common` (or `Object.defineProperty`/`Object.fromEntries`), and add a test with a `__proto__` preset name.
2. `test/split.test.ts` does not test four behaviours the code and card claim: removing each of them leaves the suite green (rule: a claimed behaviour needs a test that can fail).
   - Quote and backslash escaping in `nozzleIs` (`split.ts:15`). A probe with a nozzle id of `M 'q\ 0.4` round-trips correctly today, but nothing keeps it that way.
   - The no-diameter warning (`split.ts:95-99`).
   - Grouping by vendor: a same-named `machine_model` in another vendor must not take the preset (`split.ts:65,89`).
   - The toolhead-count mismatch going standalone (`split.ts:109`). A probe with `nozzle_diameter: ['0.6','0.6']` behaves correctly but is not tested.
   Fix: one case for each in `test/split.test.ts`.

Not blocking, for a follow-up: unlike Prusa's `splitVariants` (which sets `flow` from `nozzle_high_flow`), the nozzles get no `flow`, `material` or `volume_type`, although Orca and Bambu have `nozzle_type` and `nozzle_volume_type` and use HF variants. For example, Flashforge Guider4 `0.4` and `0.4HF` both become diameter-0.4 nozzles that differ only by id. Also, a degenerate `printable_area` such as `x,x,x` is accepted as an all-zero bed, the same as upstream's `istringstream`.

**2026-10-26, sp10-prf-126-fix:** both review problems fixed in `src/adapters/split/split.ts` and `test/split.test.ts`.
1. `__proto__`: `native`, the model's `common` settings and each override's `rest` are now `Object.create(null)` maps, so a preset name or settings key `__proto__` stays an own key. `rest` needs it too: profile-api's `merge` reads `b[k]` without an own-key check, so a plain `rest` returned `Object.prototype` for `__proto__` and broke the round-trip (profile-api issue, not fixed here; for a follow-up card on profile-api). New test: a preset named `__proto__` plus a `__proto__` settings key in both presets; `native` and the model settings keep it as an own key, and both nozzles round-trip through `applyOverrides`. It failed on the old code (`hasOwn(native, '__proto__')` false).
2. Four new tests: a nozzle id with a quote and a backslash (`M 'q\ 0.4`) selects its override with no diagnostics; a `nozzle_diameter: ['0']` preset stays standalone with the warning; a `['0.6','0.6']` preset (two toolheads) stays standalone with an info; a same-named `machine_model` in another vendor does not take the preset. The test helper now replaces backslashes in fixture file paths (the reader rejects them as unsafe).
- Mutation probes (each applied temporarily, then restored; each made exactly one test fail): `native` plain object; `common` plain object; `rest` plain object; no escaping in `nozzleIs`; no-diameter branch removed; model looked up by name without vendor; toolhead-count check removed.
- Checks: `pnpm install`, `pnpm lint` (eslint, prettier, tsc), `pnpm build` pass; `pnpm test` 8 files, 102 tests pass; `node scripts/run.mjs checks` exits 0 (84 pass, 0 fail).

**Review passed (sp10-coordinator, re-review of the fix round; the coordinator wrote none of this code)**: profiles-orca `pnpm test` 8 files / 102 passed. Probe: the three `Object.create(null)` maps (`split.ts:55,123,130`) back to `{}` fails the `__proto__` test (1 of 8 split tests), restored (`cmp` clean). The four behaviours the review listed now have tests (the fix worker's probes, one failing test each). Follow-ups: nozzle type and volume type not mapped (review note, PRF-200 family); profile-api `merge` reads inherited keys (filed as its own card).
