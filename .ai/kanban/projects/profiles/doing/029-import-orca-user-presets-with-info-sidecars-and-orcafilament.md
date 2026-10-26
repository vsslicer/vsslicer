---
id: 29
title: Import Orca user presets with .info sidecars and OrcaFilamentLibrary
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US12
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [27, 135]
created: 2026-10-25
---

Reads `user/<id>/` presets and their `.info` sidecars and the shared OrcaFilamentLibrary.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/user/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] A fixture `user/<id>/` tree imports with parent links resolved to vendor entities and `meta.base_version` set from the sidecar
- [x] A user preset whose parent is missing gets a diagnostic and stays importable as a standalone entity

## Tasks

- [x] Read sidecars
- [x] Link parents
- [x] Write tests

## Progress

**sp10-prf-29 (2026-10-26):** done.

- Code: `src/adapters/user/read-user-presets.ts` (`readOrcaUserPresets(files, tree, limits?)`, pure; `.info` INI per OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:670-700 `load_info`, :1820-1844). `meta.base_version` = sidecar `base_id` (parent setting_id; "null" = none). Parent resolves to a vendor preset of the same type, else another user preset, else `unknown-parent` warning and the preset stays standalone. `loadProfileTree` got an optional `suffixes` arg (default `.json`) so `.info` files load. Bounds: file count, per-file and total bytes (treeLimits), safePath, duplicate names (case/NFC folded), type must match folder. Bundle folders `_local/` are not read.
- Not done: mapping to unified entities (composing importer card).
- Mutation probes (each restored): base_id dropped, parent link off, file-size cap, total cap, count cap, duplicate check, safePath, nil mapping: all FAIL a test (nil scalar probe survived first, test tightened).
- Verification: `pnpm test` 6 files, 80 tests pass; `pnpm lint` fails only on PRF-28's unformatted `src/adapters/variants/variants.ts` (not mine); my files eslint/prettier clean; `pnpm build` ran; `node scripts/run.mjs checks` exit 0.

**Review failed (sp10-rev-prf-28-29, 2026-10-26)**

- Ran in `profiles-orca`: `pnpm install` ok; `pnpm lint` pass (PRF-28's file is now formatted); `pnpm build` pass; `pnpm test` 7 files, 89 tests pass; `node scripts/run.mjs checks` exit 0. `load_info` quote (OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:670-700) matches, including `"null"` -> empty for `setting_id` and `base_id`. Layering ok; AGPL header present.
- Mutation probes (temp copy): base_id dropped, vendor link off, user link off, safePath off, NFC/case fold off, folder-type check off, `"null"` id mapping off, sidecar setting_id ignored, file-size cap off, nil in arrays: all FAIL a test.
- Hostile probes: `../` path refused; non-string `type: 7` accepted as the folder type (fine); `__proto__` keys land in a null-prototype object.

Problems:

1. `src/adapters/user/read-user-presets.ts:93`: presets in `user/<id>/<type>/base/` are skipped silently. Orca loads that folder first as "custom roots" (OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:2007-2010; detached presets are saved there, `path_from_name` :4487-4488), and other user presets inherit them. Probe: `user/42/filament/base/My Root.json` plus `user/42/filament/Child.json` with `inherits: "My Root"` gives presets `[Child]` and an `unknown-parent` warning; `My Root` is gone without a diagnostic. Fix: read the `base/` subfolder of each type folder as user presets (same bounds), so their children link; a file the reader does not recognise under `user/` should not vanish silently.
2. `src/adapters/user/read-user-presets.ts:120-121`: the preset name comes from the JSON `name` key, falling back to the file stem, while the comment on :120 says the file name is Orca's identity. Orca names a user preset by its file stem (Preset.cpp:2038-2043, `canonical_preset_name`), so a file `N.json` with `name: "Different"` imports here as `Different` and links differently from Orca. Fix: use the file stem as the name (as the comment says), and warn when the inner `name` disagrees; add a test with a mismatched `name`.

Note, not blocking: Orca skips a user preset whose name equals an already loaded system preset (Preset.cpp:2044-2048, "Preset already present, not loading"); this reader imports it. Decide in the composing importer or here, and say which.

**sp10-prf-28-29-fix (2026-10-26):** review problems 1 and 2 fixed; the note decided here.

- `src/adapters/user/read-user-presets.ts`: `user/<id>/<type>/base/` presets (and their `.info`) are read, sorted before the rest so a `base/` custom root wins a name clash, as Orca loads it first (OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:2007-2010). Any other file under `user/` (including `_local/` bundles) now gives an `unknown-type` warning instead of vanishing; files outside `user/` are still ignored silently (not ours).
- Name is the file stem (Preset.cpp:2038-2043); an inner `name` that differs gives a new `name-mismatch` warning (`TreeDiagnosticCode` in `src/adapters/tree/read-tree.ts` gained the code).
- Note decided here: a user preset named like a vendor preset of the same type is skipped with a `duplicate` warning, as Orca does (Preset.cpp:2044-2048).
- Tests (`test/read-user-presets.test.ts`, 4 new): base/ roots first and children link; unrecognised files under user/ warn; stem name with mismatch warning and linking by stem; vendor-named user preset skipped.
- Mutation probes (each in place, restored, `vitest run` on the two test files): `base/` dropped from the regex; base-first sort removed; unknown-file warning removed; name from inner `name` again; mismatch warning removed; vendor-name skip off: all FAIL a test.
- Verification: `pnpm install`, `pnpm lint` (eslint, prettier, tsc), `pnpm build` pass; `pnpm test` 8 files, 97 tests pass; `node scripts/run.mjs checks` exit 0. CHANGELOG Unreleased PRF-29 line extended.

**Review failed (sp10-rerev-prf-28-29, 2026-10-26)**

- Ran in `profiles-orca`: `pnpm install` ok; `pnpm lint` (eslint, prettier, tsc) pass; `pnpm build` pass; `pnpm test` 8 files, 97 tests pass. `node scripts/run.mjs checks` exits 1, only on the repo-wide registry lines for tooling@0.8.5 (every module's lockfile pins 0.8.4); not caused by this card.
- Last review's problems 1 (`base/` roots read first, unknown `user/` files warn) and 2 (name is the file stem, `name-mismatch` warning) are fixed, and the vendor-name note is decided (skip with `duplicate`, Preset.cpp:2044-2048). Mutation probes, each in place and restored, run on `test/variants.test.ts` + `test/read-user-presets.test.ts`: `(base\/)?` dropped from the regex; base-first sort off; unknown-file warning off; name from the inner `name`; mismatch warning off; vendor-name skip off: all killed.
- Hostile probes (temporary test, removed): `user/42/filament/base/sub/X.json` gives `unknown-type` (ok); a type folder named `constructor`, `toString`, `hasOwnProperty` or `__proto__` does not.

Problems:

1. `src/adapters/user/read-user-presets.ts:100` (with `DIRS` at :29): `DIRS[m[2]!]` looks the folder name up on a plain object, so inherited keys pass the type check. Probe: `user/42/constructor/X.json` with `{"inherits":"Nope"}` imports as a preset named `X` whose `type` is the `Object` function (`toString` and `hasOwnProperty` give functions, `__proto__` gives `Object.prototype`), with only an `unknown-parent` warning. A `PresetType` that is not one of the three strings then reaches every consumer. Fix: input-derived keys are looked up as own keys only (`Object.hasOwn(DIRS, m[2])`, or a `Map`/null-prototype object), the same rule `variants.ts` already follows; add a test with a `constructor` (or `__proto__`) folder expecting `unknown-type` and no preset.

For the coordinator: `vsslicer/modules/profiles-orca/pnpm-lock.yaml` changed at 12:20 to tooling@0.8.5 while I reviewed (not by me: my `pnpm install` said "Already up to date"); some other re-lock is touching this module.

**Carried to SP11 (sp10-coordinator, 12:40):** its second fix (the `DIRS[m[2]]` own-key check from the latest review) could not be dispatched: the permission classifier refused the dispatch twice. The fixed-but-unreviewed work is parked, untracked, under `.ai/local/wip/SP10/` at the same paths (`src/adapters/user/read-user-presets.ts`, `test/read-user-presets.test.ts`, and the changed `src/adapters/tree/load-tree.ts`, `read-tree.ts`, `src/index.ts`), with its CHANGELOG line in `.ai/local/wip/SP10/PRF-29-changelog-line.md`. Copy them back before continuing. Nothing of it is committed.
