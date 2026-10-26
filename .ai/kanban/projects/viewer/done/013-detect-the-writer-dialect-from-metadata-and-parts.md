---
id: 13
title: Detect the writer dialect from metadata and parts
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US4
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [3]
created: 2026-10-25
---

A pure function over core metadata and the part list that returns the dialect, mirroring the slicers' own rules.

**Code:** `vsslicer/modules/3mf/src/domain/detectDialect.ts` (module: `3mf`, layer: `domain`)

## Acceptance criteria

- [x] Returns bambu, orca, prusa2, prusa3, cura or core for each fixture, including the Orca file with a `BambuStudio-` Application string and the Prusa 3.0 alpha
- [x] The Prusa 2.99.1 legacy cut-off and the `Cura/` folder rule are covered by tests
- [x] Unknown writers return `core` with the Application string kept

## Tasks

- [x] Write the rules
- [x] Table-driven tests from fixtures

## Progress

Done (sp10-vwr-13). `src/domain/detectDialect.ts`: `detectDialect(metadata, partNames) -> {dialect, application?}`, reads only the already-scanned root metadata and part names (no inflate, no loop over bytes; one anchored regex, linear). `Dialect` `prusa` renamed `prusa2` (unused elsewhere). Rules and quotes: Application `BambuStudio-` / `OrcaSlicer-` prefixes and the `OrcaSlicer` tag (OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp:4174-4182, :199); Bambu prefix (BambuStudio@79df7ae:...bbs_3mf.cpp:4328); `PrusaSlicer-` prefix and 2.99.1 cut-off (PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Format/3mf/Model3mf.cpp:150, 916-930; unparsable version is not legacy); `Metadata/PrusaSlicer3_project.json` (ProjectFileConstants.hpp:7); `Metadata/Slic3r_PE.config` (PrusaSlicer-2.9@b028299:src/libslic3r/Format/3mf.cpp:92); `Cura/` folder (Cura@5bea2f8:plugins/3MFReader/ThreeMFWorkspaceReader.py:221). Not used: the Prusa 3 `projectfile` relationship (Relations.cpp:23), since detection takes names and metadata only; the project part name covers it. Cura Application string not verified, so the folder rule alone decides.
Tests (`test/detectDialect.test.ts`, table-driven, 16 synthetic cases + real fixtures pa_pattern=bambu, production_ext=core, booleans=core). No real Orca or Prusa 3.0 alpha file is local; those cases are synthetic metadata (Orca with BambuStudio- + OrcaSlicer tag; PrusaSlicer-3.0.0-alpha12).
Mutation probes: cut-off [2,99,1]->[2,99,0] fails 2; `Cura/` prefix broken fails 1; Orca tag ignored fails 1.
Verify: 3mf lint, build clean; test 12 files / 181 tests pass; `run.mjs checks` exit 0. CHANGELOG Unreleased updated; index.ts exports detectDialect.

**Dependency on VWR-10, VWR-11, VWR-12 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with VWR-10, VWR-11, VWR-12.

**Review failed (sp10-rev-vwr-13)**
Ran in `vsslicer/modules/3mf`: install ok, lint clean, build clean, test 12 files / 181 passed; `node scripts/run.mjs checks` exit 0.
Mutation probes (temp copy, `test/detectDialect.test.ts`): cut-off 2.99.1->2.99.0 fails 2; equal-version returns false fails 2; Orca tag ignored fails 1; `Cura/`->`Cura` fails 1; drop `application` fails 11; drop project.json rule, Slic3r_PE rule, `OrcaSlicer-` rule, tag-only rule, unparsable->legacy each fail 1. Every test can fail.
Hostile probes: Application `PrusaSlicer-` + 5M digits / `1.`+5M digits / `2.9.`+5M zeros+`x` each ~1.6 ms (anchored, `\d{1,9}` bounded, so linear); 200k part names ~70 ms. Layering: domain, pure, no imports beyond `project.ts`. Rename: `Dialect` is only in 3mf (`project.ts:4`, `index.ts:16`); `'prusa'` hits elsewhere are profile-api's own `Dialect` (`profile-api/src/domain/catalogue/entry.ts`), and gcode-parser (the only `@vsslicer/3mf` user) never names a dialect. Rename is safe.
Upstream checks that hold: Orca writes `Application = "BambuStudio-" + SLIC3R_VERSION` and then the `OrcaSlicer` tag right after it (OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp:7276, 7306-7313); Bambu writes `SLIC3R_APP_KEY-SLIC3R_VERSION`, key `BambuStudio` (BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp:7391, version.inc:5); Prusa 2.9 writes `PrusaSlicer-<ver>` (PrusaSlicer-2.9@b028299:src/libslic3r/Format/3mf.cpp:3110); Prusa 3 writes `SLIC3R_BUILD_ID` = `PrusaSlicer-3.0.0-alpha12+UNKNOWN` (PrusaSlicer@30ef591:Model3mf.cpp:1914, version.inc); cut-off and `> last_old_stored_version` match Model3mf.cpp:150, 916-930.

Problems:
1. `src/domain/detectDialect.ts:38-45`: a Cura project saved from another slicer's file is detected as that slicer. Cura copies every root metadata entry of a loaded 3MF into the scene (Cura@5bea2f8:plugins/3MFReader/ThreeMFReader.py:271-272) and keeps `Application` on save if already set, "this field should store the original application that created the 3mf" (plugins/3MFWriter/ThreeMFWriter.py:323-326). So a Bambu/Orca/Prusa file re-saved as a Cura project carries `Application: BambuStudio-...` (and the `OrcaSlicer` tag) plus `Cura/...` parts. Probe: `detectDialect(Map{Application:'BambuStudio-02.03.00.70'}, ['Cura/preferences.cfg'])` returns `bambu`. Rule: a `Cura/` part is positive evidence of the writer and must win over `Application`; check it first, and add a test case for it.
2. `src/domain/detectDialect.ts:16`: upstream semver accepts `major.minor` with patch defaulting to 0 (PrusaSlicer@30ef591:bundled_deps/semver/semver.c:182-211, "patch version is not mandatory"), so `PrusaSlicer-2.9` is legacy upstream; here it returns `prusa3` (probe). Rule: mirror `semver_parse`: patch optional, and at most three numeric parts. Add a test.
3. `test/detectDialect.test.ts:46`: a missing real fixture makes the test pass silently. Skip with a reason (`it.skipIf` / `ctx.skip`) as the card's dependency note requires.
4. `test/detectDialect.test.ts:20`: the label "(published)" is wrong: Orca's minimal published 3MF erases both `Application` and the `OrcaSlicer` tag (bbs_3mf.cpp:7264-7274), so it is `core`, and Orca never writes the tag without `Application` (:7306). Keep the rule (harmless), relabel the case "tag only, defensive". Also the Progress note "Cura Application string not verified" is out of date: Cura writes `getApplicationDisplayName()` (ThreeMFWriter.py:326); state that in the JSDoc and say why the folder rule decides.

**Fix (sp10-vwr-13-fix)**
1. `Cura/` parts are now checked first and win over `Application` (Cura@5bea2f8:ThreeMFReader.py:271-272, ThreeMFWriter.py:323-326); tests: Bambu Application + `Cura/` part -> cura, Bambu + Orca tag + `Cura/` -> cura.
2. Prusa version mirrors `semver_parse` (PrusaSlicer@30ef591:bundled_deps/semver/semver.c:182-211): patch optional (defaults 0), at most three parts. `PrusaSlicer-2.9` -> prusa2, `3.0` -> prusa3, `2.9.1.1` -> unparsable -> prusa3; tests added.
3. Real-fixture test uses `it.for` with `ctx.skip(reason)` when the file is missing (all three present locally, so they run).
4. Orca tag-only case relabelled "defensive: Orca never writes it alone" (bbs_3mf.cpp:7264-7274, 7306). Correction to the earlier Progress note: Cura writes `getApplicationDisplayName()` (ThreeMFWriter.py:326) and keeps a loaded foreign `Application`, so the folder rule decides (stated in the JSDoc).
Mutation probes: Cura-first check removed fails 3; patch made required fails 1; extra version parts allowed fails 1.
Verify: 3mf lint, build clean; test 12 files / 186 tests pass (detectDialect 24); `run.mjs checks` exit 0 (one earlier run failed transiently, rerun passes).

**Review passed (sp10-rerev-vwr-13)**
Ran in `vsslicer/modules/3mf`: install ok, lint clean (eslint, prettier, tsc), build clean, test 12 files / 186 passed (detectDialect 24); `node scripts/run.mjs checks` exit 0.
The four points of the earlier failed review, checked against upstream:
1. Fixed. `detectDialect.ts:43` checks `Cura/` parts before `Application`, matching Cura@5bea2f8:plugins/3MFReader/ThreeMFReader.py:271-272 (loaded metadata copied into the scene) and plugins/3MFWriter/ThreeMFWriter.py:323-326 (a set `Application` is kept). Tests at lines 30-41.
2. Fixed. The regex at `:16` mirrors PrusaSlicer@30ef591:bundled_deps/semver/semver.c:175-211 (`semver_parse_version`: patch defaults to 0, 2 or 3 parts only). `semver_parse` (:142-163) strips `+meta` and `-pre` first, and `Semver::parse` (src/slic3r-base/src/Slic3r/Semver.cpp:59-67), which `is_old_stored_version` calls (Model3mf.cpp:916-930), wraps it. Probes: `2.99`, `2.9-alpha` and `2.9+win64` give prusa2; `2.9.1.1` gives prusa3.
3. Fixed. The real-fixture test uses `it.for` with `ctx.skip(reason)`. Probe: renaming a fixture to `nope.3mf` reports 23 passed and 1 skipped instead of a silent pass.
4. Fixed. Relabelled "defensive: Orca never writes it alone". The JSDoc at `:33-35` now states Cura's `getApplicationDisplayName()` and why the folder rule decides.
Mutation probes on the new tests (each made temporarily and restored, diff clean): removing the Cura-first loop fails 3; moving the Cura check after the `Application` rules fails 2; making the patch required fails 1; allowing a fourth part fails 1. Hostile: a 5M-digit Prusa version plus 200k part names takes about 70 ms in total, which is linear.
Non-blocking notes: (a) changing the patch default from 0 to 9 does not fail any test, because nothing sits at the cut-off without a patch. A one-line case `PrusaSlicer-2.99` -> prusa2 would pin it. (b) Upstream accepts an empty slice (`PrusaSlicer-2.` parses as 2.0.0, legacy), while here it gives prusa3. No real writer emits that.
Fixed in place (no behaviour change): the CHANGELOG Unreleased entry now names the Cura-first rule and the semver parsing.
