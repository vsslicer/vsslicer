---
id: 34
title: "Split per-nozzle Prusa printer presets into printer_model, nozzle and overrides"
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [25, 135]
created: 2026-10-25
---

Imported Prusa printer presets that exist once per nozzle become one `printer_model`, `nozzle` entities and `overrides`, and `printer_notes` keyword tests become tags.

**Code:** `vsslicer/modules/profiles-prusa/src/application/import/split/` (module: `profiles-prusa`, layer: `application`)

## Acceptance criteria

- [x] The MK4S 0.4/0.6 fixture yields 1 printer_model + 2 nozzles; resolving model plus nozzle equals the original preset values
- [x] `printer_notes` keyword tests are tagged through the tag table; an unknown keyword gives a diagnostic
- [x] The native form of each original preset stays attached for export

## Tasks

- [x] Detect nozzle variants
- [x] Extract overrides
- [x] Tag printer_notes
- [x] Tests

## Progress

Not started.

**sp10-prf-34 (2026-10-26):** done, to review.
- Code (in `src/adapters/import/` as the coordinator asked, not the card's `application/import/split/`): `split.ts` (`splitVariants`), `notes.ts` (`noteTags`), `import.ts` (tags on printer presets; split per file; `importPrusaIni(files, { splitVariants: false })` keeps the PRF-25 shape). Tests in `test/adapters/import.test.ts`; fixture `test/fixtures/ini/mk4s-nozzles.ini` (flattened from PrusaResearch.ini@b028299, PROVENANCE updated). CHANGELOG line. `src/index.ts` unchanged (no new export).
- Upstream relationship: a printer preset belongs to a model and a nozzle variant through its `printer_model` and `printer_variant` keys (PrusaSlicer-2.9@b028299:src/libslic3r/Preset.cpp:428-433, `set_visible_from_appconfig`; `find_system_preset_by_model_and_variant` at :1727-1737); the `[printer_model]` lists them in `variants` (:205-215). `printer_notes` is read as `unescape_string_cstyle` (Config.cpp:128-150). AGPL-3.0 provenance noted in the code.
- Shape: a bundle preset with both keys, whose `[printer_model]` is in the same file and whose bed and toolheads equal the model's, becomes a `nozzle` (id = preset name, `diameter` from extruder 0, `flow` from `nozzle_high_flow`, `renamed_from` kept). The model gets the settings every variant shares, one `overrides` block per nozzle (`when: nozzle.id == '<id>'`, quotes and backslashes escaped) and `nozzles`. Native form stays under the nozzle id, unchanged.
- Golden (PrusaResearch.ini@b028299): 200 of 217 presets split; all 200 resolve (`applyOverrides(model, {nozzle: {id}})`) to the unsplit settings, bed and toolheads, native forms identical. 17 are kept as their own printer_model with an info diagnostic: the MMU2/MMU3 models hold 1-extruder (single) and 5-extruder presets of the same variant, which are not nozzle variants. MK4S: 9 shared settings, 10 nozzles.
- Tags: keyword lines of `printer_notes` in the PRF-10 tag table become `settings.tags` (an array, in note order; differing tags such as `HF_NOZZLE` land in the nozzle's override); an unknown keyword line gives a `warning` / `unknown-type` diagnostic and no tag. The notes text stays in `native_only`. The pinned bundle has no unknown keyword. `tags` lives in `settings` because profile-api's printer_model schema has no tags field; a condition context reads it as `printer.tags`.
- Not carried: per-nozzle `default_print_profile` / `default_filament_profile` (Nozzle has no defaults field) stay in each nozzle's native form; the model keeps `default_materials`.
- Bounds (rule 25): no new input loops beyond PRF-25's capped import: the split is linear in presets x settings keys, `noteTags` uses two linear regexes over a value already capped by the INI line limit, unknown-keyword diagnostics go through the 1 000 cap.
- Mutation probes (rule 19), each temporary and restored (`cmp`-checked), every one failed tests: id escaping removed (1); toolhead/bed guard removed (2); shared settings taken when any variant matches (3); flow always standard (1); native form dropped (3); tag table ignored (2); unescape removed (3); split not applied (5).
- Verify: `pnpm install` ok, `pnpm lint` clean, `pnpm build` ok, `pnpm test` 10 files / 234 tests passed (import.test.ts 23, 7 new; golden ran); `node scripts/run.mjs checks` exit 0.

**Review failed (sp10-rev-prf-34)** (2026-10-26)
- Ran: `pnpm install` ok, `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` ok, `pnpm test` 10 files / 234 passed (golden ran, not skipped), `node scripts/run.mjs checks` exit 0.
- Upstream lines checked in `.reference/repos/PrusaSlicer-2.9@b028299`: Preset.cpp:205-215 (`variants`), :428-433 (`printer_model` + `printer_variant`), :1727-1737 (`find_system_preset_by_model_and_variant`), Config.cpp:128-150 (`unescape_string_cstyle`): quoted correctly.
- Golden independently re-run from `dist`: 35 models hold 200 nozzles; the 17 kept are exactly the MMU1/MMU2/MMU2S/MMU3 multi-extruder presets (the "Single" ones split); every split preset's `printer_variant` is listed in its model's `variants`; 0 unknown-keyword diagnostics. `settings.tags` validates against profile-api's entity schemas (golden `checkAll` validates every entity, nozzles against the nozzle schema). Layers fine (adapters only, no VS Code, no cross-module relative imports). `index.ts` export of `download` is PRF-40's.
- Notes bounds: `KEYWORD` and the unescape regex are linear; tags bounded by the tag table; unknown-keyword messages sliced to 100 chars and go through the 1 000 diagnostic cap.
- Mutation probes (temporary, restored, `cmp`-checked), killed: `every`->`some` for shared settings (2), `printer_variant` check removed (1), quote/backslash escaping dropped (1), `\r` unescape broken (1), tag table ignored (2), `.` dropped from KEYWORD (1), unknown-keyword diagnostic removed (1), high flow never read (1), toolhead guard removed (2), first nozzle dropped from `nozzles` (3). Survived: `Object.hasOwn(settings, k) &&` removed (equivalent: settings values are never `undefined`, fine).

Problems:
1. `src/adapters/import/split.ts:38`: the bed half of the guard is untested. Probe: delete `!isDeepStrictEqual(p.bed, model.bed) || ` -> all 23 import tests pass, golden included (no pinned preset differs in bed from its model). This guard is what keeps "model plus nozzle resolves to the original preset" true for `bed`, which lives on the model, not in settings. Fix: add a preset with a different `bed_shape` to the "is not split" test (`test/adapters/import.test.ts:191`) and assert it stays a printer_model with the info diagnostic. Rule: every guard that protects an acceptance criterion has a test that fails without it.
2. `src/adapters/import/split.ts:49-51`: the no-diameter branch is untested. Probe: `if (!(diameter > 0))` -> `if (false)` -> all tests pass. Fix: a preset with `nozzle_diameter = abc` (or `0`) in the same test, asserting the `warning` and that it is not split (or remove the branch if `toEntity` already makes it unreachable, and say so).
- Fixed in place (no behaviour change): `notes.ts` doc now says a trailing lone backslash is dropped, where upstream `unescape_string_cstyle` returns false and the value is rejected (the noteTags test feeds one and claims parity).
- Nit, not blocking: the two "not split" diagnostics use code `malformed-line`; neither is a malformed line.

**sp10-prf-34-tests (2026-10-26):** fixed review problems 1 and 2, test-only change in `profiles-prusa/test/adapters/import.test.ts` ("is not split" test).
- Added preset `PB` (own `bed_shape`): stays a printer_model with the info "bed or toolheads differ" diagnostic. Added `PD` (`nozzle_diameter = abc`): stays a printer_model with the `warning` "no nozzle diameter".
- Mutation probes (temporary, restored, `cmp`-checked): bed half of the guard deleted -> 1 test fails; `if (!(diameter > 0))` -> `if (false)` -> 1 test fails.
- Verify: `pnpm lint` clean, `pnpm build` ok, `pnpm test` 10 files / 236 tests passed, `node scripts/run.mjs checks` exit 0. Nit (diagnostic code `malformed-line`) left as is.

**Review passed (sp10-coordinator, re-review of the fix round; the coordinator wrote none of this code)**: profiles-prusa `pnpm test` 236 passed. Probe: bed half of the guard removed (`split.ts:38`) fails 1 of 23 import tests, restored (`cmp` clean); the fix worker's diameter probe (`if (false)` at `:49`) also fails 1. The first review's other findings stand. Nit left: the two "not split" diagnostics use `malformed-line`.
