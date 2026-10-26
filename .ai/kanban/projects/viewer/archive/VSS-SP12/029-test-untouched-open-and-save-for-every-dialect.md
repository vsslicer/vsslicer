---
id: 29
title: Test untouched open and save for every dialect
type: chore
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US9
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [9, 23, 25, 27]
created: 2026-10-25
---

One CI test opens and saves each fixture and compares every part, relationship and content type.

**Code:** `vsslicer/modules/3mf/test/roundtrip/` (module: `3mf`, layer: n/a (ci))

## Acceptance criteria

- [x] Bytes are identical per part for Bambu Studio, OrcaSlicer, PrusaSlicer 2.9, Prusa 3.0 alpha and Cura fixtures
- [x] Replacing one part leaves the others identical on each fixture
- [x] A mutated saver fails the test (meta-test)

## Tasks

- [x] Write the test
- [x] Meta-test

## Progress

Added `vsslicer/modules/3mf/test/roundtrip/roundtrip.test.ts` and two fixtures (`OrcaBadge.3mf`, `wipe_tower.3mf`, see fixtures/real/PROVENANCE.md).
Fixtures: Bambu (auto_pa_line_single, pa_pattern), Orca (OrcaBadge, Elegoo_stringhell), PrusaSlicer 2.9 (fdm_roundtrip1), Prusa 3.0 alpha tree (wipe_tower: from the 3.0.0-alpha12 clone but written by 2.9.0; no upstream file is written by a 3.0 alpha, a gap), Cura (built in the test in Cura's writer layout; no real Cura project file exists upstream, a gap).
Compared: whole-file bytes, rootModel, every part name/content type/relationships, zip entry names, raw bytes per entry and part bytes. Replace test replaces each part in turn (old bytes plus newline).

Probes (rule 19), per criterion:
- Identical bytes per fixture: made save() always rewrite 3D/3dmodel.model through writeZip: 13 tests failed (untouched and replace); restored.
- Replace leaves others identical: meta-test 'a replace that also touches another part' must throw; passes.
- Mutated saver fails: three meta-tests (byte flip, recompress-all, greedy replace) each assert the comparison throws; they pass, so the comparison detects each.
Verification (macOS): pnpm lint clean, build ok, pnpm test 23 files / 386 tests pass, `node scripts/run.mjs checks` pass. Roundtrip file takes about 20 s (replace per part on OrcaBadge); replace tests have a 60 s hang guard.

Release lines: none (tests only).

**Review passed (sp12-rev-vwr-29)**

Ran in `vsslicer/modules/3mf` (macOS): `pnpm install --frozen-lockfile` ok, `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` ok, `pnpm test` 23 files / 386 tests pass (roundtrip file 17 tests), `node scripts/run.mjs checks` exit 0.
Provenance: `OrcaBadge.3mf` and `wipe_tower.3mf` shasum-identical to `.reference/repos/OrcaSlicer@09aa0114` and `PrusaSlicer@30ef5919` at the paths in PROVENANCE.md; Application metadata reads BambuStudio-02.06.00.51 and PrusaSlicer-2.9.0 as stated.
Mutation probes (in a `mktemp -d` copy, roundtrip file only):
- AC1 untouched bytes: `save()` with no changes rewrites `3D/3dmodel.model`: 7/7 untouched tests fail.
- AC1/AC2 raw bytes: writeZip recompresses every untouched entry (same content): 6/7 replace tests fail; the Cura one survives because its fixture is built by `buildZip`, which deflates like the writer (the real fixtures cover it). With the raw-entry loop (roundtrip.test.ts:47) also removed, all 17 pass, so that loop is the load-bearing check and it is present.
- AC2 others identical: a replace that also rewrites `[Content_Types].xml`: 7/7 replace tests fail. A replace that moves the first entry to the end: 7/7 fail.
- AC3 meta-test: the three meta-tests pass (each asserts the comparison throws). Note: the byte-flip and recompress meta-tests are caught by the whole-file compare at line 59, not by `expectSame`; the probes above show `expectSame` catches them in the replace path.
Expected values come from the input bytes, not from the code under test. Layer n/a (test only); imports are inside the module. No wall-time asserts (60 s timeout is a hang guard). No parsing code added, so no hostile probes needed.
Known gaps (stated by the card, accepted): no real Prusa 3.0 alpha-written file and no real Cura project upstream; the Cura fixture is synthetic.
