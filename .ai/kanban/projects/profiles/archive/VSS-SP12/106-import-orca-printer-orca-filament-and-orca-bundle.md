---
id: 106
title: "Import .orca_printer, .orca_filament and .orca_bundle"
type: feature
priority: P1
effort: M
model: sonnet
area: [importers]
story: US43
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [103, 136, 27, 105]
created: 2026-10-25
---

Reads Orca zip bundles into entities through the Orca reader.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/bundles/orca/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] The Orca fixture bundles import with the expected entity counts (printer, filaments, processes)
- [x] A bundle with a missing listed file gives a diagnostic and imports the rest

## Tasks

- [x] Write the bundle reader
- [x] Tests

## Progress

sp12-prf-106 (2026-10-26): done, ready for review.

Files: new `src/adapters/bundles/orca/import-orca-bundle.ts` (`importOrcaBundle(bytes): ImportResult`), new `test/import-orca-bundle.test.ts` (7 tests); `src/adapters/archive/bundle-archive.ts` gained `readBundleArchive(data, {lenient})` and `BundleArchive.missing`; `src/adapters/split/split.ts` exports `bedShape`. Design: bundle entries are fed to `readOrcaUserPresets` as `user/bundle/{machine,filament,process}/`, then converted to printer_model / material / process (id = preset name; later same-named preset of another kind is refused with an error). A bundle holds only the user's diff, so absent bed, filament type/diameter and layer height get placeholders (zero bed, `unknown`, 1.75, 0.2) with a warning each. Orca fixture imports 1 printer, 1 filament, 1 process.
Bounds: archive caps from `readBundleArchive` (1024 entries, 8 MiB entry, 32 MiB total, ratio 100:1) plus the user-preset reader's limits; diagnostic file/message clipped to 300; `native` is null-prototype (`__proto__` test).
Probes (each reverted): criterion 1 - dropped the `printer/filament/process` filter `!m ||` (no-manifest test fails), dropped the listed-file filter (fails), id-collision guard off (fails), parent link off (fails), layer_height placeholder off (fails); criterion 2 - `lenient: true` removed in importer (fails), `options.lenient` in the archive reader forced off (fails).
Verification in profiles-orca: lint pass, build pass, test 13 files / 174 tests pass; `node scripts/run.mjs checks` pass. CI gate platform: ubuntu.
Release lines: CHANGELOG: `profiles-orca: importOrcaBundle reads .orca_printer / .orca_filament / .orca_bundle into printer, material and process entities; readBundleArchive takes {lenient} and returns missing.` index.ts: `export * from './adapters/bundles/orca/import-orca-bundle.ts';`

**Review failed (sp12-rev-prf-106)** (2026-10-26)

Ran in profiles-orca: `pnpm install`, `pnpm lint` (0), `pnpm build` (0), `pnpm test` 13 files / 174 tests pass; `node scripts/run.mjs checks` exit 0 (84 pass, 0 fail). Layering fine (adapters only, imports inside the module plus `@vsslicer/profile-api`), SPDX headers present. Upstream: the bundle-as-user-preset reading matches OrcaSlicer@09aa0114:src/libslic3r/PresetBundle.cpp:2410-2500 as cited.
Both criteria hold: Orca fixture gives 1 printer / 1 filament / 1 process, and a listed-missing file gives an `unreadable-folder` error while the rest imports. Hostile probes (script outside the repo): raw-JSON `"__proto__"` and `"constructor"` keys and a `__proto__.json` preset stay plain data, no prototype pollution; an unsafe listed path (`../x.json`) is refused even in lenient mode (profile-api still runs `unsafePath`); 2000 listed-missing files give 2000 diagnostics, bounded by `BUNDLE_LIMITS.maxFiles` (10 000). Entities checked with ajv against profile-api `entitySchemas`: bed, type, diameter and layer_height are schema-valid. Settings fail only on raw per-extruder arrays (`nozzle_diameter`, `nozzle_temperature` must be keyed maps), which the folder importer has too, so that is outside this card (sent to the coordinator).
Mutation probes on a `mktemp -d` copy (11): killed: lenient off, missing-diagnostic loop off, listed filter off, id-collision guard off, `native` as `{}`, diameter placeholder 1.75 -> 2, archive `missing` filter off. **Survived: 4.**

1. `src/adapters/bundles/orca/import-orca-bundle.ts:22`: `MAX_MESSAGE = 300` set to 3000 and every test still passes. The card lists the 300 clip as a bound, and a bound needs a test that asserts the exact cap (SP12). Fix: a preset whose message goes over the cap (a 400-character name hitting the id-collision error, for example), asserting `message.length === 303` (300 plus `...`) and that `file` is clipped the same way.
2. `import-orca-bundle.ts:103`: removing `if (!shape) placeholder('printable_area')` still passes. The placeholder test gives P a `printable_area`, and the fixture test checks only that there are no errors. Fix: one printer without `printable_area`, asserting the 3-point zero bed and its warning.
3. `import-orca-bundle.ts:104,117`: replacing the toolhead count with a constant 1, or `max_height` with a constant 0, still passes. Fix: assert `toolheads.count` for a two-nozzle `nozzle_diameter` and `max_height` from `printable_height`.

Not blocking: refusing a second preset of another kind with the same name is stricter than Orca, which keeps printers, filaments and processes in separate collections. It is still a reasonable choice while `native` is keyed by entity id alone.

sp12-prf-106b (2026-10-26): reworked, ready for review. Only `test/import-orca-bundle.test.ts` changed (+2 tests, 9 total); no source change.
Fixes for the 3 survivors: (1) 400-char preset name hits the id-collision error; asserts message and file length both exactly 303. (2) printer without `printable_area`: asserts the 3-point zero bed, `max_height` 0 and the single `printable_area` warning. (3) printer Q with two `nozzle_diameter` and `printable_height` 250: asserts `toolheads.count` 2 (P gives 1) and `max_height` 250.
Probes (each reverted): MAX_MESSAGE 300 -> 3000 (fails); `placeholder('printable_area')` removed (fails); toolhead count forced to 1 (fails); `max_height` forced to 0 (fails). Criteria 1 and 2 probes from the first round stand.
Verification in profiles-orca: lint pass, build pass, test 13 files / 176 tests pass; `node scripts/run.mjs checks` exit 0. CI gate platform: ubuntu.
Release lines: unchanged from above.
