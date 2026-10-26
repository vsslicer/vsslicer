---
id: 112
title: Import .curaprofile
type: feature
priority: P1
effort: M
model: sonnet
area: [importers]
story: US46
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [111, 131, 31, 136]
created: 2026-10-25
---

Reads Cura profile exports into user quality entities.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/bundles/cura/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] The real fixture imports with the expected settings and parent quality
- [x] A file from another Cura version gives a version diagnostic

## Tasks

- [x] Write the reader
- [x] Tests

## Progress

sp12-prf-112. Added `src/adapters/bundles/cura/read.ts` (`readCuraProfile(data, {settingVersion?, archiveLimits?})`) and `test/curaprofile-read.test.ts` (5 tests). It reads entries through PRF-131's guarded archive reader, maps each to a `quality_changes/<encoded id>.inst.cfg` SourceFile and reuses `readCuraUserChanges` (entry ids stay opaque: `/`, `#`, spaces). Extruder entries (with `position`) take layer_height from the global entry via a second pass. Parent quality = `native[id].quality_type` (no `inherits`: a quality id is not derivable from quality_type without the printer, and a dangling one would be unknown-parent). A setting_version other than the target's (default 27, `CURA_SETTING_VERSION`) gives a warning per entry; an archive error gives an error diagnostic and no entities (bounds are the archive's limits, passable; no new parsing loops).

Verification (macOS, CI gate platform: ubuntu): lint, build ok; module tests 205 passed (12 files); `run.mjs checks` ok.

Probes (criterion by criterion): fixture imports with expected settings/parent: dropping the global-height second pass fails 2 tests; dropping `encodeURIComponent` of ids fails the slash/hash test. Version diagnostic: replacing the `v !== String(expected)` guard with false fails 1 test. Archive-error branch: rethrowing instead of a diagnostic fails 1 test.

Found, not fixed (outside this card): `writeCuraProfileArchive` with id `__proto__` writes a wrong entry name (`0`), as it builds a plain `{}` Zippable.

Release lines:
- CHANGELOG: Added `readCuraProfile`: reads a `.curaprofile` export as quality_changes entities with the parent `quality_type` in native and a setting_version diagnostic (PRF-112).
- index.ts: `export { readCuraProfile } from './adapters/bundles/cura/read.ts';`

**Review failed (sp12-rev2-prf-130)**
Ran in profiles-cura: `pnpm install`, `pnpm lint`, `pnpm build` ok; `pnpm test` 205 passed / 12 files (curaprofile-read.test.ts 5); `node scripts/run.mjs checks` exit 0.
Criteria: expected values match the fixture as unzipped by hand (global `layer_height = 0.2`, `adhesion_type = none`; extruder `infill_pattern = gyroid`, `material_print_temperature = 245`, `quality_type = standard`, `setting_version = 20`). The version rule matches Cura (`CuraContainerRegistry.py:94-100`, Cura@5bea2f8; Cura refuses, we warn, as the card says).
Mutation probes (temp copy, each applied, curaprofile-read.test.ts run, restored): version guard off killed (1 failed); second pass dropped killed (2); `encodeURIComponent` dropped killed (1); archive error rethrown killed (1). Survived: the leading-dot escape and the `position` filter.
Hostile probe: a Python-built zip with entries `__proto__`, `constructor`, `hasOwnProperty`, `.dot`: all four import, `native` has a null prototype. Passes.
Problems:
1. `read.ts:14`: the `.replace(/^\./, '%2E')` escape is untested. Probe: with it removed, the `.dot` entry disappears with no diagnostic (3 entities instead of 4, `diagnostics: []`), and all 5 tests still pass. This is a hostile-input rule (an entry id is untrusted) whose failure loses data silently. Fix: add a test with an entry whose id starts with `.` and assert it imports under that id.
2. `read.ts:32`: the `position === undefined` filter is untested. Removing it leaves all tests green, because the extruder entries in the tests have no `layer_height` and drop out through `layer_height_estimated` anyway. Rule: every guard has a test that fails without it, or the guard goes. Either add a test where an extruder entry has its own `layer_height` with the same definition and quality_type as the global one, and another extruder entry takes the global's height, or delete the filter if that case is out of scope.
3. Criterion 1 ("expected ... parent quality") is asserted only for the extruder entry. Add `native[global id].quality_type === 'standard'` to the fixture test.
Not blocking: the version comparison is on strings (`'027'` warns; Cura compares `int()`s). With several global entries of the same definition and quality_type, the last one sets the extruders' height (probe: `.dot` 0.1 won over `__proto__` 0.3); a real export has one global entry. The `__proto__` bug in `writeCuraProfileArchive` from the Progress note is still open and needs a card.

sp12-prf-112b (review fixes). Added three tests to `test/curaprofile-read.test.ts` (no source change): (1) a `.dot` id imports under that id; (2) global 0.3, extruder e1 with own 0.15, extruder e2 with none: heights `{g: 0.3, e1: 0.15, e2: 0.3}`; (3) the fixture test now asserts the global entry's `native.quality_type === 'standard'`. Probes: removing the leading-dot escape fails the dot test; replacing the `position === undefined` filter with `true` fails the height test. Verification: lint, build ok; module tests 207 passed; `run.mjs checks` exit 0 (CI gate platform: ubuntu). Not fixed: string version comparison (`'027'`), multiple global entries (last wins), `writeCuraProfileArchive` `__proto__` bug still needs a card. Release lines unchanged.

**Coordinator re-review (sp12-coordinator, rule 29, against the FAIL criteria):** the three gaps have tests; probe "leading-dot escape removed" fails 1 of 7 (rerun by the coordinator, restored), the worker probed the position filter. Pass.
