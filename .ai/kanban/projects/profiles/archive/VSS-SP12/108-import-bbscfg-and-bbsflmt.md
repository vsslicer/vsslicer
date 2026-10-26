---
id: 108
title: Import .bbscfg and .bbsflmt
type: feature
priority: P1
effort: M
model: sonnet
area: [importers]
story: US44
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [103, 136, 27, 105]
created: 2026-10-25
---

Reads Bambu Studio bundles (they share the layout family with Orca bundles).

**Code:** `vsslicer/modules/profiles-orca/src/adapters/bundles/bambu/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] The Bambu Studio fixtures, including the real saved bundle, import with expected counts; `setting_id` and `filament_id` land in `external_ids`
- [x] A version mismatch gives a diagnostic

## Tasks

- [x] Write the reader
- [x] Tests

## Progress

Done by sp12-prf-108. Code: `vsslicer/modules/profiles-orca/src/adapters/bundles/bambu/import-bambu-bundle.ts` (`importBambuBundle(data, file?) -> ImportResult`), test `test/import-bambu-bundle.test.ts` (6 tests). `.bbscfg` and `.bbsflmt` share the zip layout `readBundleArchive` reads, so one reader serves both (a `.bbsflmt` just has only `filament/`). Limits and zip safety come from `readBundleArchive`; per-call entities <= 1024, diagnostics <= 3 per entry, messages cut to 300 chars, null-prototype maps for input keys.
Design notes: ids are file stems; `inherits` -> `[parent]`; printer -> printer_model (bed from printable_area when present, else empty), filament -> material, process -> process (layer_height 0 when the saved diff lacks it). `setting_id`/`filament_id` -> `native[id].external_ids`, material also `external_ids.bambu_filament_id` (profile-api's Material has no setting_id field). profile-api's DiagnosticCode is closed with no version code, so a version problem uses `malformed-line` with message "version mismatch..." (suggest a `version-mismatch` code in a later profile-api release). The real saved fixture holds no setting_id/filament_id (diffs only), so that criterion is tested on a synthetic zip.
Criteria probes (each mutation made the named tests fail, then restored): fixtures counts/ids: nozzle_diameter count -> 1 (2 tests fail); unknown-parent diag removed (2 fail); setting_id/filament_id: external_ids -> {} (1 fail) and bambu_filament_id dropped (1 fail); version mismatch: check -> false (1 fail), unsupported manifest version: diag removed (1 fail); duplicate-stem guard removed (1 fail); null-prototype native -> {} (1 fail).
Verify (macOS dev machine; CI gate runs on ubuntu-latest, not exercised here): lint, build clean; `pnpm test` 13 files / 173 tests pass; `node scripts/run.mjs checks` passed.
Release lines:
- CHANGELOG: `Added: importBambuBundle reads Bambu Studio .bbscfg and .bbsflmt bundles into an ImportResult (PRF-108).`
- src/index.ts: `export * from './adapters/bundles/bambu/import-bambu-bundle.ts';`

**Review failed (sp12-rev-prf-106)** (2026-10-26)

Ran in profiles-orca: `pnpm install`, `pnpm lint` (0), `pnpm build` (0), `pnpm test` 13 files / 174 tests pass (this card's tests and PRF-106's together); `node scripts/run.mjs checks` exit 0 (84 pass, 0 fail). Layering fine, SPDX header present. Upstream checked: BambuStudio@79df7ae:src/libslic3r/PresetBundle.cpp:1016-1100 (`import_presets`) ignores `bundle_structure.json`, flattens every entry and imports each through `import_json_presets` (:1102-1200). That code takes the preset name from the `name` key, refuses a preset whose `version` does not parse as semver (:1118-1119), and sorts presets into collections by `*_settings_id`. It never compares the preset version with the manifest version. The card's criterion leaves the version check open, so the preset-versus-manifest warning is accepted as written.
Criteria: counts and ids hold for both fixtures, `setting_id`/`filament_id` land in `external_ids` (synthetic zip), and a version mismatch gives a warning. Mutation probes on a `mktemp -d` copy (11): killed: version check off, `external_ids` as `{}`, `bambu_filament_id` dropped, duplicate-stem guard off, `native` as `{}`, `nil` mapping off, unknown-parent diagnostic off. **Survived: 4.** Hostile probe: raw-JSON `"__proto__"`/`"constructor"` keys stay plain settings keys, no pollution.

1. **Entities break the profile-api schema, on both fixtures including the real saved bundle.** Checked with ajv against `entitySchemas`. The printer gets `bed.shape: []` (`import-bambu-bundle.ts:99`, from the local `bedShape` at :27-36), but the schema needs `minItems: 3` (profile-api `domain/schema/printer-model.ts:15`). The process gets `layer_height: 0` (:114), but the schema needs `exclusiveMinimum: 0` (`domain/schema/process.ts:8`). Rule: an importer only emits entities that satisfy the contract. When a diff lacks a required unified field, use a valid placeholder and a warning, as PRF-106 does (3-point zero bed, layer height 0.2). The material `type: ''` should become `unknown` the same way. Add a test that validates every entity from both fixtures against `entitySchemas` (ajv is already a dev dependency in profiles-prusa; add it here). Leave out the per-extruder settings errors (`nozzle_diameter` and similar as raw arrays): the folder importer has those too, and they are sent to the coordinator separately.
2. **False `unknown-parent` warning** (`:124-130`): a preset whose parent is in the same bundle is still told the parent "is not in the bundle". Probe: `filament/A.json {inherits:"Generic PLA"}` plus `filament/B.json {inherits:"A"}` gives that warning for B. Fix: warn only when `inherits` names no preset of the same kind in the bundle, and test the in-bundle case.
3. **Untested parsing and bounds:** breaking `bedShape` (`p.split('x')` -> `'y'`), raising the message clip from 300 to 3000 (:43), dropping the `IDENTITY` key strip (:79), or making `settings` a plain `{}` (:77) all still pass. The `__proto__` test (test:92) writes `{ __proto__: 1, constructor: 2 }` as a JS object literal, so `JSON.stringify` never sends a `__proto__` key and the test cannot fail. Fix: a printer with a `printable_area` asserting its points; a message over 300 characters asserting the exact cap; raw JSON text with `"__proto__"` and `"constructor"` keys asserting they are own keys of a null-prototype `settings`; an assertion that `name`/`inherits`/`setting_id` are not in `settings`. Better still, drop the local `bedShape` and use the one PRF-106 exported from `split/split.ts`, which already parses the `NxM` form, so the two readers cannot drift apart.

Not blocking: a listed file missing from the zip makes `readBundleArchive` (strict) refuse the whole bundle, but Bambu Studio imports the rest. PRF-106 added `{ lenient: true }` for this case, so the same behaviour costs one line here. The id is the file stem, but Bambu Studio uses the `name` key.

**Review fixes (sp12-prf-108b)** (2026-10-26)

Code: `import-bambu-bundle.ts`, test `import-bambu-bundle.test.ts` (14 tests). (1) Entities now satisfy `entitySchemas`: a missing/invalid `printable_area` gives a 3-point zero bed, a missing `filament_type` gives `unknown`, a missing `layer_height` gives 0.2, each with a `malformed-line` warning "... placeholder used" (as PRF-106). The local `bedShape` is gone; the importer uses `bedShape` from `split/split.ts`. A test validates every entity of both fixtures with ajv (errors under `/settings` are filtered out: the per-extruder arrays gap, reported to the coordinator separately). (2) `unknown-parent` fires only when no preset of the same kind in the archive has the stem `inherits` names; in-bundle and missing cases tested. (3) New tests: bed points from a `printable_area`; raw JSON text with `"__proto__"`/`"constructor"` keys are own keys of a null-prototype `settings`, identity keys absent; exact caps 200 (parent, stem) and 64 (version) echoed chars, cap accepted and cap+1 cut. The 300-char message clip was dead (every message is built from already-bounded pieces, archive messages are <=~130), so it is removed instead of tested. Not-blocking item done: `readBundleArchive(data, { lenient: true })`; a listed file missing gives an `unreadable-folder` error and the rest imports (tested). Id stays the file stem.
Probes (each mutation made tests fail, restored): lenient off (1), printable_area warning removed (2), placeholder bed removed (1), `type` placeholder 'unknown' -> '' (2), layer_height 0.2 -> 0 (2), layer_height warning removed (2), in-bundle parent check removed (1), stem slice 200 removed (1), parent slice 200 -> 201 (1), version slice 64 -> 65 (1), IDENTITY strip off (1), null-prototype settings -> {} (1), missing-file diagnostic removed (1).
Verify (macOS dev; CI gate runs on ubuntu-latest): build clean, `pnpm test` 13 files / 184 tests pass (with ajv linked temporarily). **Needs coordinator:** add devDependency `"ajv": "^8.20.0"` to profiles-orca `package.json` (same as profiles-prusa) and run `pnpm install`; until then lint (import-x/no-extraneous-dependencies) and the test file's ajv import fail. Then `lint` and `run.mjs checks` (phantom-dependency check passed for all but the temporary link) should pass; I could not run them green without editing package.json.
Release lines: package.json devDependencies: `"ajv": "^8.20.0"`. CHANGELOG/exports unchanged from the lines above.

**Review passed (sp12-rev2-prf-108)** (2026-10-26)

Ran in profiles-orca with the coordinator's `"ajv": "^8.20.0"` devDependency: `pnpm install` (up to date), `pnpm lint` 0 (eslint, prettier, tsc), `pnpm build` 0, `pnpm test` 13 files / 184 tests pass; `node scripts/run.mjs checks` exit 0 (84 pass, 0 fail). Layering fine (adapters only, no VS Code, in-module imports only), SPDX header present.
Previous review: (1) every entity of both fixtures, the real saved bundle included, now validates against `entitySchemas` outside `/settings` (3-point zero bed, `unknown` type, layer height 0.2, each with a "placeholder used" warning); the local `bedShape` is gone in favour of `split/split.ts`'s. (2) `unknown-parent` now checks `<kind>/<inherits>` against the archive; in-bundle and missing cases tested. (3) bed points, raw-JSON `"__proto__"`/`"constructor"` as own keys of a null-prototype `settings`, identity keys absent, exact caps 200/64 at cap and cap+1. Dropping the 300-char clip is accepted: probes with a 5000-char manifest version, a 5000-char missing path and a 10 kB bad JSON value give messages of 42, 34 and 60 chars. The lenient missing-file case is done and tested.
Mutation probes (temporary edits, restored), all killed: in-bundle parent check off (1), `bedShape` -> undefined (2), placeholder bed -> `[]` (2), type `unknown` -> `''` (2), `setting_id` out of IDENTITY (1), null-prototype `settings` -> `{}` (1), lenient off (1), version cut 64 -> 65 (1), stem cut removed (1), layer_height warning removed (2), 0.2 -> 0 (2), missing-file diagnostic off (1), `nil` mapping off (1). Criteria: counts/ids (fixture test), `external_ids` (synthetic test), version mismatch (version test) all have killing probes above and in the earlier Progress.
Not blocking, for a later card: these survive the suite: `from`, `version` or `filament_id` dropped from IDENTITY (they then leak into `settings`), material vendor fixed to `User`, printer `max_height` fixed to 0. A preset inheriting itself, or `sub/X` naming a nested `printer/sub/X.json` that is skipped, gets no `unknown-parent` warning. Release lines (CHANGELOG, `src/index.ts` export) are still the coordinator's to apply.
