---
id: 25
title: Flatten Prusa sections into unified entities and golden counts
type: feature
priority: P0
effort: L
model: opus
area: [importers]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [24, 135, 10, 136]
created: 2026-10-25
---

Turns parsed Prusa sections into unified entities (keys through the catalogue, conditions through the converters) with the native form kept beside each, and removes abstract sections after flattening.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/import/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [x] Golden counts for `PrusaResearch.ini`: 1 vendor, 35 printer models, 238 printers, 633 prints, 6 069 filaments after flattening; no abstract section remains
- [ ] Every entity validates against the E11 JSON Schema; every native key is mapped or listed `native_only` in diagnostics, none dropped
- [x] Cycle and unknown parent give a diagnostic and leave other entities importable
- [x] A user-preset fixture (not from a vendor bundle) imports with `inherits` kept

## Tasks

- [x] Map sections to entities
- [x] Flatten multi-parent inheritance
- [x] Attach the native form
- [x] Add golden-count and schema tests

## Progress

Not started.

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.

**sp10-prf-25 (2026-10-26):** done, to review.
- Code: `vsslicer/modules/profiles-prusa/src/adapters/import/` (`flatten.ts`, `import.ts`, `index.ts`), export line in `src/index.ts`, CHANGELOG line, `ajv` dev dependency (schema test). Tests `test/adapters/import.test.ts`; fixture `test/fixtures/ini/user/print/My 0.15mm @MK4S.ini` (PROVENANCE updated).
- Port: `flatten_configbundle_hierarchy` (PrusaSlicer@b028299:src/libslic3r/PresetBundle.cpp:1311-1447, AGPL-3.0): Kahn order, parents applied last-listed first filling only missing keys (`:1408-1413`), `renamed_from` never inherited (`:1409-1412`), `inherits` erased for bundle presets and kept for parents outside the file (`:1366-1374`), `*name*` sections dropped (`:1437-1446`); `unescape_strings_cstyle` (PrusaSlicer@b028299:src/libslic3r/Config.cpp:151-220) as `splitList`. Shortcut: `custom_parameters_*` JSON is not deep-merged (`:1415-1433`); the pinned bundle has none.
- Mapping: `[vendor]` -> vendor (id `repo_id`, licence `NOASSERTION`); `[printer_model]` -> printer_model (bed and toolheads from its first printer preset); per-nozzle `[printer]` -> printer_model with `family` = its `[printer_model]` id (PRF-34 splits these; matches PRF-89's `model` = preset name); `[print]` -> process; `[filament]` -> material. Ids are section names. Settings go through profile-api's `nativeToUnified` (its 55 Prusa-mapped keys); per-extruder array values are wrapped as `{"0": ...}` because the schema forbids arrays there (found by the schema test on CORE One `extruder_offset`). `compatible_printers_condition` -> `when` through `convertPrusaCondition`. Native form per entity in `ImportResult.native[id]`: kind, name, file, line, flattened verbatim `values`, `native_only` keys.
- **Golden counts corrected:** 238 / 633 / 6 069 are the section counts *before* flattening (profiles.md section 1 counts every header). After dropping 21 / 114 / 308 abstract sections the bundle yields 1 vendor, 35 models, 217 printers, 519 prints, 5 761 filaments (6 533 entities); the test asserts both. No abstract section remains; no warning or error diagnostics (257 info: per-extruder lists such as MMU `nozzle_diameter` that profile-api maps as one value stay native).
- **AC 2 left unticked:** every entity validates against the E11 schema (ajv, all 6 533) and every native key is converted or listed, but the list is `native[id].native_only`, not diagnostics: profile-api's `DiagnosticCode` is closed and has no native-only code. Adding one is a profile-api change (out of this module); coordinator to decide whether the native form satisfies the criterion. 266 of 330 distinct keys stay native-only until profile-api maps more keys.
- Bounds (rule 25), each with a hostile test: inherits depth 32 (pinned needs 10), 16 parents per section (pinned max 5), 4 000 000 inherited-key copies per call (pinned needs 476 151), 100 000 sections and 256 MiB per call; cycles found by Kahn in linear time (20 000-node cycle test), diagnostics capped at 1 000 over the call.
- Mutation probes (rule 19), each made temporarily and restored, every one failed its test: abstract kept; per-extruder wrap removed; parents applied forward; `renamed_from` inherited; cycle diagnostics removed (both cycle tests); `splitList` trimming; user file treated as a vendor bundle; system-parent propagation removed; depth check removed; parent cap removed; budget removed; budget made per file; section cap removed; byte cap removed.
- Verify: `pnpm install`, `pnpm lint` clean, `pnpm build` ok, `pnpm test` 9 files / 200 tests passed (14 new); `node scripts/run.mjs checks` exit 0 (84 pass).

**Coordinator (SP10), AC 2:** the native-only key list in `native[id].native_only` meets the criterion for this card: the data is complete and machine-readable, and profile-api has no native-only diagnostic code. The import report (PRF-63) shows it to the user from the native block; no profile-api change. Reviewers judge AC 2 as met if every native key is either converted or listed there.

**Review failed (sp10-rev-prf-25)**
Ran in `vsslicer/modules/profiles-prusa`: `pnpm install` ok, `pnpm lint` clean, `pnpm build` ok, `pnpm test` 9 files / 200 tests passed (golden ran, not skipped); `node scripts/run.mjs checks` exit 0.
Checked and fine:
- Port against PrusaSlicer-2.9@b028299:src/libslic3r/PresetBundle.cpp:1311-1447: Kahn order, parents applied last-listed first filling only missing keys (`:1408-1413`), `renamed_from` not inherited, `inherits` erased and put back for system parents (`:1366-1374`) and passed to children through the last-listed parent (`findLast`), `*`-prefixed sections dropped (`:1437-1446`, parser `abstract = name.startsWith('*')`). `;`-separated quoted lists as `unescape_strings_cstyle`.
- Golden counts recounted independently (python over PrusaResearch.ini@b028299 headers): printer 238 = 21 abstract + 217, print 633 = 114 + 519, filament 6 069 = 308 + 5 761, 35 printer_model, 1 vendor, all names unique. The corrected counts in the test are right.
- AC 2 as settled by the coordinator: every entity validates (ajv, 6 533) and every key is converted or in `native[id].native_only`. `ajv` dev dependency justified: profile-api ships the schemas but no validator, and uses `ajv ^8.20.0` as its own dev dependency.
- Mutation probes (temporary, restored, diff-checked): abstract filter removed (5 fail), parents applied forward (2 fail), depth check off (1 fail), budget per file (1 fail), system-parent propagation off (1 fail). Hostile probes: self-inherit -> cycle diagnostic; duplicate parent `*P*; *P*` ok; unterminated quoted `inherits` -> diagnostic, others import.

Problems:
1. `src/adapters/import/import.ts:345` (and `:273`): `result.native[r.entity.id] = r.native` on a plain object. A section named `[print:__proto__]` imports its entity but its native form is lost: the assignment sets the prototype of `result.native` instead of an own key (probe: `[print:__proto__]` + `[print:constructor]` -> entities `__proto__, constructor`, `Object.keys(native)` = `constructor` only). Section names are untrusted input (rule 25). Expected: every imported entity has an own `native` entry whatever its id; write with `Object.defineProperty` (or start from `Object.create(null)`) and add a test with a `__proto__` section.
2. `src/adapters/import/import.ts:133`: `compatible_printers_condition` becomes `when` even when `compatible_printers` is non-empty. Upstream ignores the condition then and uses the list (PrusaSlicer-2.9@b028299:src/libslic3r/Preset.cpp:396-410, `if (! has_compatible_printers && ! condition.empty())`). Probe: user preset `print/X.ini` with `compatible_printers = "Original Prusa MK4S 0.4 nozzle"` and `compatible_printers_condition = nozzle_diameter[0]==0.6` -> `when = "nozzle.diameter == 0.6"`, a rule PrusaSlicer never applies (a user who picks printers in the GUI keeps the inherited condition, so this shape is real; the pinned bundle has none, 0 of 6 533). Expected: convert the condition only when `splitList(compatible_printers)` is empty; otherwise leave the condition in `native_only` beside `compatible_printers`, with an info diagnostic, and a test for both shapes. (Same rule for `compatible_prints` / `compatible_prints_condition` on filaments, Preset.cpp:373, if that condition is ever converted.)

**sp10-prf-25-fix (2026-10-26):** both review changes made, to review.
1. `src/adapters/import/import.ts` (`add`): `result.native` is written with `Object.defineProperty` (enumerable, writable, configurable), so `__proto__`/`constructor` ids get own entries and `result.native` keeps its plain prototype. Test `ids such as __proto__ get an own native entry` (`[print:__proto__]` + `[print:constructor]`: both entities, `Object.keys(native)` both ids, prototype unchanged).
2. `src/adapters/import/import.ts` (`base`): `compatible_printers_condition` becomes `when` only when `splitList(compatible_printers)` is empty or the key is absent (PrusaSlicer@b028299:src/libslic3r/Preset.cpp:396-410, `if (! has_compatible_printers && ! condition.empty())`); otherwise both keys stay in `native_only` with one info diagnostic. A malformed (unsplittable) list counts as non-empty. Test `a condition beside a non-empty compatible_printers stays native` covers both shapes (`print/X.ini` with a list: no `when`, both keys native-only, one info; `print/Y.ini` with an empty list: `when = nozzle.diameter == 0.6`, no diagnostics). Filament `compatible_prints_condition` is not converted, so nothing to change there.
- CHANGELOG PRF-25 line updated for both.
- Mutation probes (temporary, restored): condition guard replaced by `if (false)` -> condition test fails; plain `result.native[id] = ...` restored -> `__proto__` test fails.
- Verify: `pnpm install`, `pnpm lint` clean, `pnpm build` ok, `pnpm test` 9 files / 202 tests passed (2 new); `node scripts/run.mjs checks` exit 0.

**Review passed (sp10-rerev-prf-25)**
Ran in `vsslicer/modules/profiles-prusa`: `pnpm install` ok, `pnpm lint` clean, `pnpm build` ok, `pnpm test` 9 files / 202 tests passed (golden ran); `node scripts/run.mjs checks` exit 0.
Both points of the failed review are fixed as asked:
1. `src/adapters/import/import.ts` `add`: `result.native` written with `Object.defineProperty`, duplicate check is `Object.hasOwn`, so `__proto__`/`constructor` ids each get an own entry and the prototype is untouched.
2. `src/adapters/import/import.ts` `base`: the condition becomes `when` only when `compatible_printers` is absent or splits to an empty list; otherwise both keys stay native with one info diagnostic. Matches PrusaSlicer-2.9@b028299:src/libslic3r/Preset.cpp:396-399 (`has_compatible_printers = ... && !values.empty()`, `if (! has_compatible_printers && ! condition.empty())`), checked in the read-only clone.
Mutation probes (temporary, restored, `cmp`-checked): guard replaced by `if (false)` -> condition test fails; guard made `cond && printers !== undefined` (ignores an empty list) -> condition test and golden fail; plain `result.native[id] = ...` -> `__proto__` test fails.
Prototype sweep of `src/adapters/import/`: no other plain object is keyed by a section name. `byName`, per-section `values`, `printers` are `Map`s; `native.values` is built with `Object.fromEntries` (own data properties, safe for `__proto__`); `settings` is keyed by catalogue unified keys only; `flat` by the fixed `PRESET_KINDS`.
Earlier findings that held stand as written.
