---
id: 54
title: Write native export to Cura quality_changes and definition_changes
type: feature
priority: P0
effort: M
model: sonnet
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [31, 136]
created: 2026-10-25
---

Writes `.inst.cfg` containers with the current `setting_version` (27).

**Code:** `vsslicer/modules/profiles-cura/src/adapters/export/cura/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] Import then export of every Cura user fixture is byte-equivalent; `setting_version` is 27 for new files
- [x] A Cura `{expr}` value is written back as the original formula text

## Tasks

- [x] Write the inst.cfg writer
- [x] Round-trip tests

## Progress

Done (sp11-prf-54).
- `src/adapters/export/cura/write.ts`: `writeCuraUserChanges`, `curaExporter` (Exporter, format 'cura'). Layout re-implemented from Uranium@e65ccc1:UM/Settings/InstanceContainer.py:488-523 (configparser: blank line after each section, `\n\t` continuations); setting_version 27 from Cura@5bea2f8:cura/CuraApplication.py:145, written only when native metadata has none (imported files keep theirs, e.g. 25).
- `src/adapters/quality/read.ts` (one line): definition_changes native now keeps `name`, so a round trip does not lose it.
- Bounds: 10 000 entities, 100 000 keys per entity, 4 MiB output per call; keys unreadable by FastConfigParser, alias ids, wrong native type, missing definition are refused with diagnostics; newline values are continued so a value cannot inject a section.
- Note: hand-written fixtures end with one newline; Cura (configparser) ends with a blank line, so byte-equivalence is tested on Cura-layout files (`test/export.test.ts`).
- Mutation probes (all fail a test when removed): expr write-back, setting_version default, `\n\t` continuation, leading-dot encoding, `+` for space, alias check, entity cap, size cap, native type check, definition check, key check.
- Verify (macOS; CI gate runs ubuntu): eslint and tsc clean, build ok, 117 tests pass (9 files), `run.mjs checks` ok. `pnpm lint` fails only on prettier for `src/adapters/instances/read.ts`, another card's file (not touched).
Release lines:
- CHANGELOG: Write user quality_changes and definition_changes as `.inst.cfg` (setting_version 27 for new files, `{expr}` back as `=formula`): `writeCuraUserChanges`, `curaExporter`.
- index.ts: `export { CURA_EXPORT_LIMITS, CURA_SETTING_VERSION, curaExporter, writeCuraUserChanges } from './adapters/export/cura/write.ts';`

**Review failed (sp11-rev-prf-54)**
Ran in profiles-cura (working tree, with PRF-127/209/210 files present): `pnpm install` ok, `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` ok, `pnpm test` 120 passed (9 files), `node scripts/run.mjs checks` exit 0. Upstream lines checked: Uranium@e65ccc1:UM/Settings/InstanceContainer.py:488-523 (serialize: metadata in `_metadata` order, values sorted), UM/FastConfigParser.py:17-18, Cura@5bea2f8:cura/CuraApplication.py:145 (`SettingVersion = 27`). Layering ok (adapters only, imports `@vsslicer/profile-api` and same-module files).
Mutation probes (temp copy, each against `test/export.test.ts`): expr write-back, setting_version default, `\n\t` continuation, leading-dot `%2E`, `+` for space, alias check, entity cap, size cap, native type check, definition check, key check, the read.ts `name` line, metadata order: all 13 killed.
Hostile probes: a value with `\n[values]\nevil = 1`, a name with `\n[values]`, a definition with `\n[metadata]`, and a native metadata key with a newline are all contained or refused; a `__proto__` id round-trips byte for byte. Leading spaces and a trailing newline in a value are lost, but Cura's own reader strips them too, so that is fine.
Problems:
1. `src/adapters/export/cura/write.ts:84-87` with `src/adapters/quality/read.ts:263`: the reader's own marker `layer_height_estimated: true` goes into `native`, and the writer prints it as Cura metadata. Probe: import a quality_changes with no `layer_height` in `[values]` (the usual case, since Cura stores only changed settings), then export it. The output gains `layer_height_estimated = true` and is not byte-equivalent. Rule: export writes only metadata that came from the file, never keys the importer added. Drop the marker in the writer, or keep it out of the native metadata.
2. `src/adapters/export/cura/write.ts:83`: `type` is always written first. Cura's deserialize keeps metadata in file order and serialize writes it in that order (InstanceContainer.py:510-513). Probe: `[metadata]` with `quality_type`, `position`, `type`, `setting_version` (the order of this module's own user fixture, `test/quality.test.ts:251`) comes back with `type` moved to the top. Rule: write native metadata in native order, and add `type` only when it is missing.
3. `src/adapters/export/cura/write.ts:38`: `goodKey` accepts keys with a space, `!` or a tab after the first character. FastConfigParser's key class is `[^=\n !]+` (FastConfigParser.py:18), so it cannot read those keys back. Probe: settings `{ 'a b', 'c!d', 'e\tf' }` export with no diagnostic, and `readCuraUserChanges` reads the file back with `settings: {}`, so the keys are lost silently. Rule: a key must match the reader's key class in full (no `=`, newline, space, `!` or tab anywhere, and no `<>[` at the start); anything else is refused with a diagnostic. Add a key with a space to the bad-keys test.
4. Criterion 1 ("every Cura user fixture"): the tests check byte equivalence only on two new inline Cura-layout strings. Once 1 and 2 are fixed, add the module's own user fixtures (`test/quality.test.ts:247-262`) as round trips, equal apart from the final blank line, plus a quality_changes without `layer_height`.

**Rework (sp11-prf-54-fix)**
- 1: `write.ts` no longer writes `layer_height_estimated` (importer marker). 2: native metadata is written in native order; `type` leads only when the native form has none. 3: `goodKey` now matches the reader's key class in full (no `=`, newline, tab, space or `!` anywhere, no `<>[!` first); `test/export.test.ts` bad-keys test gains `spacekey` (`a b`, `c!d`, `e<tab>f`). 4: new test round-trips the module's user fixtures (quality_changes, definition_changes, and a quality_changes with no `layer_height`) equal apart from the final blank line, plus one with native order `quality_type, position, type, setting_version`. The shared `roundTrip` helper now fails only on error diagnostics (the no-height file carries the importer's expected warning).
- Mutation probes (restored after each): re-add marker to the skip list removal -> 2 tests fail; type-first/order -> 2 fail; loosen key class -> 3 fail.
- Verify (macOS; CI gate runs ubuntu): eslint, prettier, build clean, 122 tests pass (9 files), `run.mjs checks` ok.

**Review passed (sp11-rerev-prf-54)**
Ran in profiles-cura (working tree, with PRF-127/209/210 files present): `pnpm install` ok, `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` ok, `pnpm test` 125 passed (9 files), `node scripts/run.mjs checks` exit 0.
Previous problems:
1. Fixed: `write.ts:88` skips `layer_height_estimated`; the no-height fixture round-trips. Probe (marker back in): 2 tests fail.
2. Fixed: `write.ts:85-91` writes native order, `type` first only when native has none (Uranium@e65ccc1:UM/Settings/InstanceContainer.py:510-513). Probes (type always first; type dropped from the loop): 3 tests fail each.
3. Fixed: `write.ts:38` matches FastConfigParser's key class (Uranium@e65ccc1:UM/FastConfigParser.py:18) and its lookahead start class, stricter on tab and `\r`. Direct probe: `a b`, `c!d`, `e<tab>f`, `x<cr>y` each alone give 0 files and 1 diagnostic. Whole-class loosening (`.*`) fails 1 test.
4. Fixed: `test/export.test.ts` round-trips the quality.test.ts user fixtures plus a no-height quality_changes and the `quality_type, position, type, setting_version` order.
Notes (not failures): (a) the bad-keys test puts all three keys in one entity, so loosening only space, only `!` or only tab survives it (probed: all 9 pass); the code is right for each (direct probe above), but one entity per key would pin each. (b) The round-trip fixtures add `setting_version = 25` to the quality.test.ts versions; the verbatim fixtures have none and export gains `setting_version = 27` (probed on the definition_changes one). Cura always writes `setting_version`, so a file without one is not a file Cura wrote, and "27 for new files" covers it.
Layering ok (adapters only; imports `@vsslicer/profile-api` and same-module files).
