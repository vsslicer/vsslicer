---
id: 104
title: Model and validate bundle_structure.json
type: feature
priority: P1
effort: S
model: sonnet
area: [importers]
story: US43
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-104-fix
depends_on: [3]
created: 2026-10-25
---

The `version`, `bundle_id`, `bundle_type`, preset lists, `printer_vendor` and `printer_asset` structure of Orca/Bambu bundles.

**Code:** `vsslicer/modules/profile-api/src/domain/bundle/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] Valid fixtures parse; unknown `bundle_type`, missing listed file and unsupported `version` each give a typed diagnostic
- [x] Exported ids use the `offline_` form; a test shows no user id is ever written
- [x] Bounds (rule 25, a bundle is untrusted): bundle_structure.json over 1 MiB, nesting deeper than 16, more than 10,000 listed files, or a path that is absolute, has '..', a NUL or is over 512 characters is refused with a typed error
- [x] Hostile tests for each bound

## Tasks

- [x] Write the types and validation
- [x] Tests

## Progress

Done. Manifest model and validation in a new `src/domain/bundle/` (`parseBundleStructure(text, entries?)` returns a result with a typed `BundleError`; `buildBundleStructure` / `offlineBundleId` for export).

Sources (OrcaSlicer@09aa0114b4e1, AGPL-3.0, structure only, no code copied): `src/slic3r/GUI/ExportPresetBundleDialog.cpp:374-425` (writer), `src/libslic3r/PresetBundle.cpp:2210-2230,2349` (printer_asset), `:2425` (bundle id escape check). `printer_vendor` from the card does not occur in that revision, so it is not modelled.

Files: `src/domain/bundle/bundle.ts`, `src/domain/bundle/index.ts`, `test/bundle.test.ts`.
Verified in profile-api: `pnpm lint` clean, `pnpm test` 332 passed, `pnpm build` ok. Hostile tests: >1 MiB (chars and multibyte), nesting 17 and a 100k unterminated bracket bomb (a linear pre-scan runs before JSON.parse), 10,001 and split-list file counts, absolute/backslash/drive/`..`/NUL/513-char paths in lists and printer_asset, unsafe bundle_id. No regex over input bytes (path parts split on a single-char class, version by a char loop).
Not done: the zip entry list comes from the caller (no zip reading here). The JSON Schema was not changed.

### Review fix (sp7-prf-104-fix)

1. `printerAsset` and its per-printer maps are built with `Object.create(null)`, so a `__proto__` key is plain data. Hostile test added.
2. `unsafePath` now refuses empty, `.`, `..` and space/dot-only segments (Windows drops trailing dots and spaces: `.. `, `...`, ` `), for bundle_id, list entries and printer_asset keys/values. Orca replaces an empty bundle_id with a UUID on export (PresetBundle.cpp:2423-2426); on import refusing is the safe choice. The check is a single-class regex on path segments (linear, length-capped at 512).
Verified: profile-api `pnpm test` 386 passed, `pnpm build` ok; `pnpm lint` fails only on prettier for `src/index.ts` (not mine).

### Coordinator: shared-file changes

`src/index.ts`: add
```ts
export { BUNDLE_LIMITS, buildBundleStructure, offlineBundleId, parseBundleStructure } from './domain/bundle/index.ts';
export type { BundleError, BundleErrorCode, BundleStructure, ParseBundleResult } from './domain/bundle/index.ts';
```

Review (sp7-rev-d): FAIL. Bounds otherwise hold (probe `/private/tmp/claude-501/sp7w.IRyk/rev-d/probe.ts`): size incl. multibyte, depth 16/17, brackets and escaped quotes inside strings, a 100 k unterminated bomb, a 1 M backslash run (3 ms), 10,001 files, absolute, `\`, UNC, `C:`, `..`, NUL and 513-char paths are all refused correctly. Failures:
1. `src/domain/bundle/bundle.ts:150,166`: a `printer_asset` key `__proto__` (JSON.parse makes it an own key) passes `unsafePath` and `printerAsset['__proto__'] = out` replaces the result object's prototype. Repro: `parseBundleStructure('{"version":"","bundle_id":"x","bundle_type":"printer config bundle","printer_asset":{"__proto__":{"bed":"bed.stl"}}}')` returns ok with `Object.keys(bundle.printerAsset)` = `[]` and `bundle.printerAsset.bed === 'bed.stl'` through the prototype: untrusted input is silently dropped and leaks into inherited lookups. Same for `out[option]` at :164 (option `__proto__` is dropped silently). Fix: build both maps with `Object.create(null)` (or refuse the key) and add a hostile test.
2. `src/domain/bundle/bundle.ts:120`: the code says bundle_id "becomes a directory name", yet `""`, `"."` and `" "` are accepted as bundle_id (repro: `bundle_id: "."` returns ok). `.` names the bundles root itself and Orca replaces an empty id with a UUID (OrcaSlicer@09aa0114:src/libslic3r/PresetBundle.cpp:2423-2426). Refuse empty, `.` and whitespace-only ids (and `.`/empty list entries) with `unsafe-path`.
Residual, not required by the card: Windows trailing-dot/space segments (`.. `, `...`) pass; unverified whether Win32 normalisation turns them into `..`; worth a line if the importer ever writes these paths to disk.

Review (sp7-rev2-e): PASS
- Checked: src/domain/bundle/bundle.ts, index.ts, test/bundle.test.ts (untracked, card's own files only); domain layer, imports nothing outside the module; no shared files edited (src/index.ts, package.json, CHANGELOG unchanged); Orca cited for structure only (AGPL-3.0, no code copied). profile-api `pnpm lint` clean, `pnpm test` 386 passed, `pnpm build` ok.
- Re-ran sp7-rev-d's probe plus extra cases (/private/tmp/claude-501/sp7w.iJAr/prf/probe.ts). Fix 1: outer and inner `__proto__` keys are now own keys on null-prototype maps; nothing comes through inheritance and the data is kept. Fix 2: empty, `.`, `..`, `.. `, `...`, ` `, `a/`, `a//b`, `a/./b`, `a/ ./b` are refused as `unsafe-path` in bundle_id, list entries, and printer_asset keys and values; `ok/b.stl` is accepted.
- Rule-25 bounds re-checked: 1 MiB (multibyte), depth 16 ok / 17 too-deep, 100k unterminated bomb, 1M backslash run 2.6 ms, 10,001 list files and 10,001 printer_asset files too-many-files (12 ms), absolute/`\`/UNC/`C:`/NUL/513-char refused, 1,900 x 500-dot segments 9 ms, 60k empty printer_asset entries 128 ms (bounded by the 1 MiB cap). Linear throughout.
- Residual, not in the card: `CON` (a Windows device name) is accepted as bundle_id, a colon after the first character (`a/C:/x`) passes, and Unicode look-alikes (`．．/x`) pass. None of them escapes the directory. Worth handling when the importer writes to disk.
