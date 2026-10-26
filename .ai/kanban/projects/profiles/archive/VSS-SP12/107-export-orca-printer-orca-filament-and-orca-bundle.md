---
id: 107
title: "Export .orca_printer, .orca_filament and .orca_bundle"
type: feature
priority: P1
effort: M
model: sonnet
area: [export]
story: US43
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [106, 53, 135]
created: 2026-10-25
---

Writes Orca bundles from selected entities, without secrets, with an `offline_` bundle id.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/bundles/orca/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] `import(export(x))` equals x for printer, filament and bundle types
- [x] `export(import(b))` is byte-equivalent to b for an unmodified fixture where the zip format allows (entry order and timestamps documented where not)
- [x] No `bundle_id` contains a user id

## Tasks

- [x] Write the bundle writer
- [x] Round-trip tests

## Progress

Done. `exportOrcaBundle(entities, native, {name, clock})` in `adapters/bundles/orca/export-orca-bundle.ts`; builds each preset with `writeOrcaUserPreset` over the file layout the importer now keeps in `native[id].json` (small edit to `import-orca-bundle.ts`), zips with `writeBundleArchive` (fixed 1980 mtime, manifest last, `offline_<name>_<clock>` id, empty version). Printer host/credential keys erased as Orca does (OrcaSlicer@09aa0114:src/slic3r/GUI/ExportPresetBundleDialog.cpp:236-243). Extension (.orca_printer/.orca_filament/.orca_bundle) is the caller's: same format.
Byte-identity: the documented Orca fixture re-exports byte-identical (entry order, mtimes, deflate level 6 all match).
Verify (macOS): profiles-orca lint, build, test 190 passed; `run.mjs checks` fail 0.
Probes: removing use of the native layout -> byte-identity test fails; dropping the `n?.inherits` fallback -> byte-identity test fails; secret erase removed -> secrets test fails. Round-trip test (printer, filament, bundle) compares entities; bundle_id asserted exactly `offline_Mine_1` (id built by profile-api `buildBundleStructure`, not probed here).

Release lines:
CHANGELOG: Export .orca_printer, .orca_filament and .orca_bundle (`exportOrcaBundle`); the Orca bundle importer keeps each preset's file layout in `native[id].json`.
index.ts: export * from './adapters/bundles/orca/export-orca-bundle.ts';

**Review failed (sp12-rev-prf-107)**

Ran (macOS): profiles-orca `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 15 files / 201 passed; `node scripts/run.mjs checks` pass 84, fail 0. Upstream erase list checked against `.reference/repos/OrcaSlicer` at 09aa0114, ExportPresetBundleDialog.cpp:236-243: matches. Layering: adapters only, imports stay inside the module, no VS Code.

Mutation probes (temp copy of the module, export-orca-bundle.test.ts): no secret filter -> 1 fails; filter on every kind -> 1 fails; ignore `native.json` -> 2 fail (byte identity, no-native round trip); drop `?? n?.inherits` -> 1 fails; skip filaments -> 5 fail; user id in bundle name -> 2 fail. Hostile: printer `__proto__.json` with `__proto__`/`constructor` setting keys and filament id `constructor` export and re-import with the keys intact; `../x` id refused.

AC probes: AC1 round trip (printer, filament, bundle) holds for Orca-imported entities, fails for name != id (problem 1); AC2 byte identity holds for the documented fixture (P3 shows it can fail); AC3 bundle id asserted exactly `offline_Mine_1`, P7 shows it can fail.

Problems:

1. `src/adapters/bundles/orca/export-orca-bundle.ts:53` and `:62` write the preset name and file name from `e.id` and never read `e.name`. An entity `{ id: 'X', name: 'Display' }` exports and re-imports as `['X', 'X']`, so the display name is lost. That breaks AC1 for entities where id and name differ, which happens for entities from other importers (profiles-cura sets `name` apart from `id`, e.g. quality/read.ts:126) and for an entity renamed in VSSlicer. Expected fix: the Orca preset identity is its name (the importer sets `id = name`), so write `name` and the file name from `e.name`, and add a test with id != name that asserts the re-imported name.
2. `test/export-orca-bundle.test.ts:61-62`: the secrets test sets only `print_host` and `printhost_apikey`. Deleting the other five keys (`print_host_webui`, `printhost_cafile`, `printhost_user`, `printhost_password`, `printhost_port`) from `SECRETS` still passes all 6 tests (P1). Expected fix: the fixture printer carries all seven upstream keys, and the test asserts that none survive.

Observation, not blocking: the writer adds `"from": "User"` when a preset has none (documented Orca behaviour), so for such a preset `import(export(x))` gains `settings.from`. A second round trip is stable, and real Orca files always carry `from`.

**Rework (sp12-prf-107b)**

1. Fixed: the preset `name` and file name now come from the entity's `name` (falling back to `id` for entities without one, e.g. Feeder). New test "the display name, not the id, names the preset" (`{id:'X', name:'Display'}` re-imports as `Display`). The unsafe-name test now sets `name` too.
2. Fixed: the secrets test fixture carries all seven upstream keys; none may survive.
Probes (macOS): name falls back to id only -> display-name test fails; deleting each of the five previously unprobed keys from `SECRETS` (webui, cafile, user, password, port) -> secrets test fails each time. AC1 (round trip, now with id != name): display-name test; AC2 (byte identity): fixture test still passes with name = id; AC3 unchanged (`offline_Mine_1`).
Verify (macOS): profiles-orca lint, build ok, test 15 files / 202 passed; `run.mjs checks` pass 84, fail 0.
Release lines: unchanged.

**Coordinator re-review (sp12-coordinator, rule 29, against the FAIL criteria):** lint and `pnpm test` 202/202 pass; probe "name from id" fails the display-name test, restored; the worker probed each of the five added secret keys. Pass.
