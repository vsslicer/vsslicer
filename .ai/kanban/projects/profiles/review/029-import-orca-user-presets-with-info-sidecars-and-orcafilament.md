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
