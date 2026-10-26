---
id: 105
title: Create Orca and Bambu Studio bundle fixtures
type: chore
priority: P1
effort: M
model: sonnet
area: [importers]
story: US43
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [120, PLT-13, 136]
created: 2026-10-25
---

Bundles built from the writers' documented layout plus at least one bundle saved by each real app.

**Code:** `vsslicer/modules/profiles-orca/test/fixtures/bundles/` (module: `profiles-orca`, layer: n/a (fixtures))

## Acceptance criteria

- [x] Fixtures from Orca@09aa0114 and Bambu Studio@79df7ae, each with PROVENANCE.md giving app and version, including at least one real saved bundle per app
- [x] Fixtures pass the PLT fixtures check

## Tasks

- [x] Build documented-layout bundles
- [ ] Save real bundles from each app
- [x] Write PROVENANCE.md

## Progress

2026-10-26 sp12-prf-105.
- Fixtures in `vsslicer/modules/profiles-orca/test/fixtures/bundles/` with one PROVENANCE.md (the check needs it on the `bundles` folder): `orca-documented/documented.orca_printer`, `bambu-documented/documented.bbscfg`, `bambu-studio-saved-presets/saved-presets.bbscfg` (real user presets saved by Bambu Studio 02.08.02.61, byte for byte; zip by our writer). Test `test/fixture-bundles.test.ts` (3 cases).
- NOT MET, criterion 1 left unticked: no bundle saved by OrcaSlicer, and none whose zip was exported by Bambu Studio's own dialog. Orca has no user presets on this machine and the export dialog cannot be driven from a script. Needs a hand capture (PROVENANCE.md names it `orca-saved/`).
- Criterion 2 met: `node scripts/run.mjs checks` passes (check-fixtures clean).
- Probe (content/test): appended a byte to bambu-documented/documented.bbscfg, test failed (1 of 3), restored, 3 pass. Criterion 2 probe not run (did not remove PROVENANCE.md to watch check-fixtures fail). CI gate platform: ubuntu.
- Verification in profiles-orca: lint pass, build pass, test 11 files / 161 tests pass, run.mjs checks pass.
Release lines: CHANGELOG none (fixtures and test only, not shipped).

**Review passed (sp12-rev-prf-105)**
- Ran in profiles-orca: `pnpm install` ok, `pnpm lint` pass (eslint, prettier incl. PROVENANCE.md, tsc), `pnpm build` ok, `pnpm test` 11 files / 161 tests pass; `node scripts/run.mjs checks` exit 0.
- Criterion 1 (settled by the coordinator: documented-layout fixtures pass it; the real Orca export moved to PRF-218): met. Layout checked against OrcaSlicer@09aa0114 `src/slic3r/GUI/ExportPresetBundleDialog.cpp:374-463` (`printer/`, `filament/`, `process/` entries, `bundle_structure.json` with `version ""`, offline `bundle_id`, `bundle_type "printer config bundle"`, `printer_preset_name "export"`); all three zips match. The three Bambu presets in `saved-presets.bbscfg` `cmp` byte-identical to `~/Library/Application Support/BambuStudio/user/3494833915/{machine,filament,process}/`; no account id in the fixture. PROVENANCE.md names app, version and origin of each.
- Criterion 2 probe: moved PROVENANCE.md away, `check-fixtures.mjs` printed "missing PROVENANCE.md" and exited 1; restored, exit 0.
- Test probes (`test/fixture-bundles.test.ts`): copied the Bambu documented zip over the Orca one, 1 of 3 failed; deleted `process/*` from the real bundle, 1 of 3 failed; both restored, 3 pass. Expected names come from the fixture data, not from the reader.
- Layering: fixtures and test only; the test imports this module's own `src/adapters/archive/bundle-archive.ts`, no cross-module import. Task "Save real bundles from each app" is carried by PRF-218.
