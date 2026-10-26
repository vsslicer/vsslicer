---
id: 28
title: Decode extruder-variant arrays for H2D and H2C into keyed per-extruder values
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US12
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [27, 135]
created: 2026-10-25
---

Bambu/Orca per-extruder-variant arrays need the printer's `printer_extruder_variant` list to be decoded into keyed values.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/variants/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] The 11 `Bambu Lab H2C` machine files (4 nozzle presets plus templates) import with the expected counts
- [x] A decoded H2C 0.4 preset keeps both extruders' values under `{"0": .., "1": ..}` and re-encodes to the original array order (round-trip test on the H2C files)
- [x] Fixture-based; the printer itself is not involved (D5)
- [x] Bounds (rule 25, added by sp10-prf-28): extruder ids integers in 1..16, at most 256 variant slots, a duplicate (extruder, variant) slot, id and variant lists of different lengths or non-array, a variant named `__proto__`, inherited keys on encode, and arrays of the wrong length; work is linear in the preset's values (input already capped by `readOrcaTree`)

## Tasks

- [x] Decode the variant list
- [x] Write keyed values
- [x] Test on the H2C files

## Progress

Not started.

**sp10-prf-28 (2026-10-26):** done, verified.

- Code (`profiles-orca`, adapters): `src/adapters/variants/variants.ts`: `decodeVariants(type, settings)` and `encodeVariants(type, settings)`, pure, applied to an `OrcaPreset`'s flattened `settings` from PRF-27's `readOrcaTree`. Exported from `src/index.ts`; CHANGELOG Unreleased line. Test: `test/variants.test.ts` (9 tests).
- Shape: per-variant options become `{"<extruder 0-based>": {"<variant name>": value}}`; machine limits (`printer_options_with_variant_2`) `[normal, silent]` pairs; per-extruder options (`printer_extruder_options`, e.g. `nozzle_diameter`) `{"0": .., "1": ..}`. The slot lists (`printer_extruder_id`/`printer_extruder_variant`, `print_extruder_id`/`print_extruder_variant`) stay arrays: they fix the encode order. Machine and process presets only; filament presets are left alone (`filament_extruder_variant` has no extruder ids, so they are per variant, not per extruder).
- Upstream: slot lookup by (id, variant) `BambuStudio@79df7ae:src/libslic3r/PrintConfig.cpp:8223-8253`, lengths `:8015-8042`, key sets the union of `:7619-7770` and `OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:10089-10260` (Orca adds e.g. `nozzle_type`, `travel_slope`, jerk and junction-deviation keys). AGPL provenance header in the file. Difference: upstream pads short arrays with their first value or truncates (`extend_default_config_length`, `Preset.cpp:210-262`, user presets only); here a wrong-length array stays an array with a `variant-length` warning. Empty arrays are "unset" (single-extruder Bambu presets have `extruder_printable_area: []`) and stay silently.
- H2C: 11 presets named `Bambu Lab H2C*` at 79df7ae (1 machine_model, 4 nozzle presets, 6 abstract g-code templates; this answers PRF-27's note: the 11th is the machine_model). Each nozzle preset decodes with 0 diagnostics into keys `0` and `1`, and `encodeVariants(decodeVariants(x))` deep-equals the flattened original. The H2C 0.4 `nozzle_volume` is asserted exactly. Every Bambu preset (3558) also round-trips with 0 diagnostics; 335 carry slot lists.
- Orca@09aa0114 (probe, not asserted): all 14343 round-trip; warnings only on data that is itself inconsistent (Custom `fdm_belt_common` single values against 3 slots, Goofoo Velo+ machine limits with 2 values for 2 slots, IdeaFormer `printer_extruder_variant: nil`, UltiMaker process with variants but no ids).
- Mutation probes (12, each applied to `variants.ts` and restored, `vitest run test/variants.test.ts`): stride 2 treated as 1; length check removed; empty-array skip removed; plain assignment instead of `fromEntries`; duplicate-slot check removed; extruder upper cap removed; slot cap removed; slot cap exclusive (`>=`); integer check loosened (first PASSED, since `'1.5'` fails the regex anyway; added a numeric `1.5` case, now FAILS); `hasOwn` replaced by `in`; pair-length check removed; encode in keyed order instead of slot order. All FAIL.
- Verification: `pnpm install`, `pnpm lint` (eslint, prettier, tsc), `pnpm build` pass; `pnpm test` 7 files, 89 tests pass (9 mine, H2C golden ran; the count includes PRF-29's tests in progress); `node scripts/run.mjs checks` exit 0 (84 node tests, check-licence, check-fixtures).
- For the composing importer: map `VariantDiagnostic` (`variant-layout`, `variant-length`; no file) into `ImportResult` with the preset's file.

**Review failed (sp10-rev-prf-28-29, 2026-10-26)**

- Ran in `profiles-orca`: `pnpm install` ok; `pnpm lint` (eslint, prettier, tsc) pass; `pnpm build` pass; `pnpm test` 7 files, 89 tests pass (H2C golden ran against the local BambuStudio@79df7ae clone); `node scripts/run.mjs checks` exit 0. Quoted upstream `get_index_for_extruder` (BambuStudio@79df7ae:PrintConfig.cpp:8223-8253) matches. Layering ok (adapters, pure, no VS Code, no cross-module imports); AGPL header present.
- Mutation probes (temp copy, plus the golden in place, restored): duplicate-slot check off, extruder cap exclusive, slot cap +1, `hasOwn` -> `in`, empty-array skip off, pair-length check off, 1-based id kept, non-array check off: all FAIL a test. One survives, below.
- Hostile probes: `__proto__` variant, inherited keys, numeric `1.5`, null lists are covered by tests and hold.

Problems:

1. `src/adapters/variants/variants.ts:256`: the per-extruder length check (`value.length !== extruders`) can be replaced by `false` and all 9 tests still pass, including the H2C/all-Bambu golden (probe run in place, restored). The card's bound "arrays of the wrong length" is tested only for a per-variant option (`z_hop`, `test/variants.test.ts` "a wrong length stays an array"); without the check a short `nozzle_diameter: ['0.4']` on a two-extruder preset decodes to `{0: '0.4'}` and then `encodeVariants` throws, so the round-trip promise breaks. Fix: every length bound gets its own case; add a per-extruder wrong-length input (e.g. `nozzle_diameter: ['0.4']` with the `h2c` slots) asserting a `variant-length` diagnostic and the array kept.

**sp10-prf-28-29-fix (2026-10-26):** review problem 1 fixed.

- Test `test/variants.test.ts` "a per-extruder array of the wrong length stays an array with a warning": `nozzle_diameter: ['0.4']` on the `h2c` slots gives one `variant-length` diagnostic, keeps the array, and `encodeVariants` round-trips it. No code change.
- Mutation probe: `value.length !== extruders` replaced by `false` in `variants.ts` (restored): the new test FAILS.
- Verification (with PRF-29's fix): `pnpm install`, `pnpm lint` (eslint, prettier, tsc), `pnpm build` pass; `pnpm test` 8 files, 97 tests pass; `node scripts/run.mjs checks` exit 0.

**Review passed (sp10-rerev-prf-28-29, 2026-10-26)**

- Ran in `profiles-orca`: `pnpm install` ok; `pnpm lint` (eslint, prettier, tsc) pass; `pnpm build` pass; `pnpm test` 8 files, 97 tests pass. `node scripts/run.mjs checks` exits 1, but only on 39 registry lines "lockfile pins @vsslicer/tooling@0.8.4, current is 0.8.5" for every module (tooling@0.8.5 released in 4d0d89a4 minutes earlier); its node tests pass. Not caused by this card.
- Problem 1 of the last review is fixed: the new test "a per-extruder array of the wrong length stays an array with a warning" (`test/variants.test.ts:73`) asserts the `variant-length` diagnostic, the kept array, and the round-trip. Mutation probe: `value.length !== extruders` (`variants.ts:256`) replaced by `false`: the test fails (killed). Restored.
- No other code changed since the last review; its passing probes, upstream check and layering findings stand.
