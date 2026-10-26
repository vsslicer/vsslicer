---
id: 42
title: Check resolved values for 20 Prusa tuples against the oracle
type: feature
priority: P0
effort: L
model: opus
area: [importers]
story: US19
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [21, 25, 34, 135]
created: 2026-10-25
---

Compares resolved (printer, nozzle, material, process) values with PrusaSlicer's last-parent-wins rule, using `profile-api` merge and overrides.

**Code:** `vsslicer/modules/profiles-prusa/test/tuples/` (module: `profiles-prusa`, layer: n/a (fixtures and tests))

## Acceptance criteria

- [x] At least 20 tuples (Prusa and SuperSlicer) equal the oracle chosen by the oracle spike (upstream CLI export, else hand-checked expectations citing `profiles.md` lines)
- [x] A seeded merge-order bug makes the suite fail
- [x] Fixtures only (D5)

## Tasks

- [x] Pick the tuples
- [x] Produce the oracle values
- [x] Write the comparison tests

## Progress

Not started.

Done (sp11-prf-42, 2026-10-26).

- **What:** 21 tuples, 17 Prusa and 4 SuperSlicer. Oracle: hand-checked expectations, as PRF-21 chose
  (`vsslicer/fixtures/profile-research/oracle.md`, Prusa row; `docs/research/profiles.md:31-37`). The rule is
  PrusaSlicer@b028299:src/libslic3r/PresetBundle.cpp:1413-1422 and SuperSlicer@1f3d287:src/libslic3r/PresetBundle.cpp:1290-1296:
  parents are walked in reverse and fill only keys the child lacks, so the last-listed parent wins, and `renamed_from` is skipped.
- **Files (all new, test-only):**
  - `test/tuples/oracle.ts`: the tuples. Each has `[kind, key, value, winning section, line]` checks, plus unified checks for SuperSlicer.
  - `test/tuples/tuples.test.ts`
  - `test/tuples/fixtures/PrusaResearch-cut.ini`: 132 sections cut verbatim from PrusaResearch.ini@b028299 (AGPL-3.0 data).
  - `test/tuples/fixtures/superslicer.ini`: hand-written in SuperSlicer's dialect. The SuperSlicer clone ships no bundle.
  - `test/tuples/fixtures/PROVENANCE.md`
  - Notes: `.reference/notes/PRF-42-prusa-tuples.md`.
- **Prusa checks:** for each preset, the keys whose value changes when the first parent wins, one own key and one deep
  inherited key. I compared every cited upstream line with its `key = value` text (0 mismatches) and read the parent
  order by hand for 5 presets.
- **What the tests check for each tuple:**
  1. The importer's flattened native values meet the checks.
  2. Every resolved key equals an independent hand merge of the raw sections, built with profile-api `merge`.
  3. The printer comes through `applyOverrides(model, {nozzle})` on the split model and equals the unsplit preset's
     unified settings.
  4. The SuperSlicer unified values are correct.
  5. Each check's cited section sets the value itself.
- **Seeded bug:** a first-parent-wins hand merge fails the checks of 20 of 21 tuples, and the suite asserts that number. The
  MK2.5S chains have no multi-parent conflict.
- **Mutation probes** (temporary edits, restored, `cmp` clean):
  - Forward parent loop in `src/adapters/import/flatten.ts`, the seeded merge-order bug: 20 tests fail.
  - `renamed_from` inherited: 9 fail.
  - Parent overwrites the child: 22 fail.
  - Test using `model.settings` without `applyOverrides`: 12 fail.
  - Hand merge always reversed: 21 fail.
  - A wrong cited fixture line: the cite test fails.
- **Verified:**
  - `pnpm install`, `pnpm lint` (clean), `pnpm build`, and `pnpm test`: 13 files, 320 tests passed, 25 of them new.
  - `node scripts/run.mjs checks`: exit 0, 84 pass, 0 fail, check-licence and check-fixtures pass.
  - Run on macOS; the CI gate runs on ubuntu-latest, plus the matrix job.
- **Fixtures only (D5):** no printer, no CLI, no network.

Release lines:

- CHANGELOG (profiles-prusa, Unreleased, Added): `Tuple tests: 21 PrusaSlicer and SuperSlicer (printer, nozzle, filament, print) tuples resolve to hand-checked last-parent-wins values (PRF-42).`
- No export changes.

**Review passed (sp11-rev-prf-42)** (2026-10-26)

- **Ran** in `vsslicer/modules/profiles-prusa` (with PRF-52's untracked `src/adapters/export/` work present):
  `pnpm install` 0, `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` 0, `pnpm test` 13 files / 320 passed,
  `vitest run test/tuples` 25 passed. `node scripts/run.mjs checks`: exit 0, 84 pass, 0 fail.
- **Oracle:** PRF-21 chose hand-checked expectations for PrusaSlicer (`vsslicer/fixtures/profile-research/oracle.md:145`);
  the tuples follow it. Upstream loop checked read-only: PrusaSlicer-2.9@b028299:src/libslic3r/PresetBundle.cpp:1411-1423
  and SuperSlicer@1f3d287:src/libslic3r/PresetBundle.cpp:1288-1297 (reverse parent walk, child-missing keys only,
  `renamed_from` skipped). SuperSlicer header `Config.cpp:2080` matches.
- **Citations:** a script compared all 132 Prusa checks with `.reference/repos/PrusaSlicer-2.9/resources/profiles/PrusaResearch.ini`
  @b028299: every cited line is `key = value` and lies in the cited `[kind:section]` (0 mismatches). Every non-blank line of
  `PrusaResearch-cut.ini` is an in-order subsequence of the upstream file (verbatim cut confirmed).
- **Mutation probes** (temp copy, `mktemp -d`, removed after):
  - forward parent loop in `flatten.ts` (seeded merge-order bug): 20 fail;
  - `renamed_from` inherited: 9 fail; parent overwrites child: 22 fail;
  - test's first-parent-wins `reverse()` removed (seeded-bug test made toothless): 1 fails;
  - `applyOverrides` replaced by `model.settings`: 12 fail;
  - wrong SuperSlicer cite line: 1 fails; wrong Prusa cite section: 1 fails; one check value changed: 3 fail.
- **Other:** test-only, no new parsing code (rule 25 n/a), no wall-time asserts, imports only in-module `src/` and
  `@vsslicer/profile-api`. D5: fixtures only.
- **Notes for the coordinator (not failures):** Prusa cite line numbers are verified by hand/script only; the test checks
  them for SuperSlicer only, as the comment says. The oracle's `custom_parameters_*` deep-merge rule is not exercised:
  the upstream 2.9.6 bundle has no such key. CHANGELOG line not yet in `CHANGELOG.md` (given above as a release line).
