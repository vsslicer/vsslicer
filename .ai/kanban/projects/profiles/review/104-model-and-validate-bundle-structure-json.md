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
sprint: "VSS:SP9"
owner: sp7-prf-b
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

### Coordinator: shared-file changes

`src/index.ts`: add
```ts
export { BUNDLE_LIMITS, buildBundleStructure, offlineBundleId, parseBundleStructure } from './domain/bundle/index.ts';
export type { BundleError, BundleErrorCode, BundleStructure, ParseBundleResult } from './domain/bundle/index.ts';
```
