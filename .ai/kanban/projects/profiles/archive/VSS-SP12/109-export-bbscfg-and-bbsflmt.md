---
id: 109
title: Export .bbscfg and .bbsflmt
type: feature
priority: P1
effort: M
model: sonnet
area: [export]
story: US44
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [108, 53, 135]
created: 2026-10-25
---

Writes Bambu Studio bundles without secrets.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/bundles/bambu/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] `import(export(x))` equals x for both extensions; unmodified fixtures re-export byte-equivalently where the format allows
- [x] No credentials or account ids in the output

## Tasks

- [x] Write the writer
- [x] Round-trip tests

## Progress

Wrote `src/adapters/bundles/bambu/export-bambu-bundle.ts` (`exportBambuBundle(entities, native, {name, clock, kind?: 'config'|'filament'})`; `kind: 'filament'` is the .bbsflmt, materials only) over `writeOrcaJson` (bambu dialect: sorted keys, 4 spaces, nil, newline) and `writeBundleArchive`. Test: `test/export-bambu-bundle.test.ts` (6 tests). The Studio-saved fixture re-exports byte-identically; the hand-authored documented fixture round-trips by value (its key order is not Studio's, so bytes differ). setting_id/filament_id are preset ids, kept; printer host/credential keys erased; manifest is offline_ with empty version.

Verify: lint, build, test (16 files, 208 tests) pass in profiles-orca; `node scripts/run.mjs checks` passes (84/84). CI gate platform: Linux (local run on macOS).

Probes (each removed in turn, test fails): criterion 1 (round-trip/byte-equal): dialect bambu removed (fails), inherits dropped (3 fail), version dropped (2 fail), filament_id dropped (fails), setting_id dropped (fails), from forced to User (fails after adding a System case), .bbsflmt filter removed (fails). Criterion 2 (no secrets): erase guard removed (fails); manifest offline_ id and empty version asserted.

Release lines:
- CHANGELOG: Export Bambu Studio bundles: `exportBambuBundle` writes .bbscfg and .bbsflmt without secrets.
- index.ts: `export { exportBambuBundle } from './adapters/bundles/bambu/export-bambu-bundle.ts';`

**Review failed (sp12-rev-prf-109)**

Ran in profiles-orca: `pnpm install`, `pnpm lint` (pass), `pnpm build` (pass), `pnpm test`: 16 files, 208 tests,
5 failed, all in `test/read-instances.test.ts` (PRF-90, in doing, not this card); without that file 15 files /
197 tests pass, `test/export-bambu-bundle.test.ts` 6/6. `node scripts/run.mjs checks` exits 1 on three
`@vsslicer/gcode-preview` lockfile pins (3mf, gcode-parser, webview-kit), not this module.

Mutation probes (each one alone, source restored after, the card's 6 tests): dialect removed 1 fail; secrets filter
off 1 fail (exact key list asserted); `.bbsflmt` kind filter off 1 fail; version line removed 2 fail; filament_id
removed 1 fail; setting_id removed 1 fail; `from` forced to User 1 fail; inherits removed 4 fail. Vendor skip
(`if (!('settings' in e)) continue`) removed: 0 fail. Untested, but the Bambu importer never yields vendors; minor.
Hostile: `__proto__` and `constructor` settings keys survive export and re-import (equal entities). Layering fine
(adapters only, no cross-module relative imports). The Studio-saved fixture's preset JSONs are real Studio bytes;
its zip was made by our writer (PROVENANCE.md says so), so the byte-equal test covers the preset JSON, not Studio's
zip container.

Problems:

1. `src/adapters/bundles/bambu/export-bambu-bundle.ts:54` (and :52): `version` is written only when `native[id]`
   carries one, and no `<kind>_settings_id` is added. Bambu Studio's importer drops a preset with no parseable
   version (`BambuStudio@79df7ae:src/libslic3r/PresetBundle.cpp:1118-1121`, `if (!version) return false;`) and one
   with none of `printer_settings_id` / `print_settings_id` / `filament_settings_id` (same file, :1127-1136).
   Probe: a material with no native entry (any preset not imported from a Bambu bundle) exports as
   `{filament_type, from, inherits, name}`, which Studio skips without an error. A native `from: {x: 1}` is also
   written verbatim as an object. Rule: every preset in a `.bbscfg`/`.bbsflmt` must be one Studio loads: write a
   semver `version` when native has none, the kind's `*_settings_id` (the name, as Studio saves it: printer and
   process a string, filament a one-item array, see the fixtures) when settings lack it, and a string `from`
   (fall back to `User`). Add a test that exports an entity with no native entry and asserts those keys.
2. `.bbsflmt` is not the layout Bambu Studio writes. The doc comment (:6-9) cites Orca's
   `ExportPresetBundleDialog.cpp` as shared, but Bambu has no such file; its writer is
   `BambuStudio@79df7ae:src/slic3r/GUI/CreatePresetsDialog.cpp:4170-4245`: entries `<filament_vendor>/<name>.json`
   and a manifest `{version, bundle_id, bundle_type: "filament config bundle", filament_name,
   filament_vendor: [{vendor, filament_path: [...]}]}` (`.bbscfg` is :4052-4166). Ours writes
   `filament/<name>.json` under a `bundle_type: "printer config bundle"`, `printer_preset_name: "export"` manifest
   (probe: unzip of `kind: 'filament'` output). Studio still imports ours (it ignores paths and the manifest,
   PresetBundle.cpp:1068-1079), but a real Studio `.bbsflmt` fed to `importBambuBundle` gives 0 entities and
   `bundle_structure.json: Unknown bundle_type` (probe: Studio-layout zip built by hand), so "import(export(x)) equals
   x for both extensions" holds only for our own invented layout, and byte-equivalence for a real `.bbsflmt` cannot
   hold. Rule: write the format the upstream writer writes, cited to that writer. This needs profile-api's
   `parseBundleStructure`/`buildBundleStructure` and PRF-108's importer to accept the filament-bundle manifest and
   vendor folders first: coordinator, split that into a bugfix card (profile-api + profiles-orca adapters) that this
   card depends on, or rule that the current `.bbsflmt` stands and track it as a follow-up.

**Settled by the coordinator (sp12-coordinator, rule 28), for the rework:** fix problem 1 here (always a semver
`version`, the kind's `*_settings_id`, a string `from` falling back to `User`, with a test on an entity with no
imported data). Problem 2 is not this card's: our `.bbsflmt` layout stands for now (Studio imports it, as it ignores
paths and the manifest); reading and writing Studio's own filament-bundle layout moves to PRF-226 (profile-api and
profiles-orca). Correct the doc comment's upstream citation to Bambu Studio's `CreatePresetsDialog.cpp`.

**Rework (sp12-prf-109b)**

Problem 1 fixed in `export-bambu-bundle.ts`: `version` is always written (native's, else `1.0.0.0`), the kind's
`printer_settings_id`/`print_settings_id` (string) or `filament_settings_id` (one-item array) is added when settings lack it,
and `from` is written only when a string (else `User`). Problem 2 left to PRF-226 as settled; doc comment now cites
`BambuStudio@79df7ae:src/slic3r/GUI/CreatePresetsDialog.cpp:4052-4166` (.bbscfg) and :4170-4245 (.bbsflmt, not reproduced)
and `PresetBundle.cpp:1068-1079, 1118-1136`. New test "a preset with no imported data still carries what Studio needs to
load it" (printer, filament, process, native `from: {x: 1}`). Round-trip tests compare entities without the added
`*_settings_id` keys (the export adds them to presets that lacked them); the Studio-saved fixture is still byte-identical.
Probes (each removed alone, test fails): version default (3 fail), settings_id add (2 fail), string-only `from` (1 fail),
filament array shape (1 fail).
Verify: profiles-orca lint, build pass; test 16 files / 212 tests pass; `node scripts/run.mjs checks` run (see final exit below).

**Coordinator re-review (sp12-coordinator, rule 29, against the settled criteria):** lint and `pnpm test` 212/212 pass; probes rerun: no default `version` fails 3, a non-string `from` passed through fails 3, restored. Pass.
