---
id: 41
title: Create the `profiles-data-orca` module with the Orca and Bambu JSON trees
type: chore
priority: P0
effort: M
model: sonnet
area: [importers]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-41-fix
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, 22]
created: 2026-10-25
---

The pinned data package (D2): Orca@09aa0114 (14 420 files) and Bambu@79df7ae (3 589 files) with their LICENSE and `source.commit`; bed models and textures are fetched on first use.

**Code:** `vsslicer/modules/profiles-data-orca/` (module: `profiles-data-orca`, layer: n/a (data package))

## Acceptance criteria

- [x] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/profiles-data-orca`; `node scripts/run.mjs ci` picks it up
- [x] The module contains the JSON trees, `LICENSE` files, `NOTICE` and a `source.commit` file; no Prusa data
- [x] A build script regenerates it from the pinned commits and the result is reproducible (hash test)
- [x] File counts equal 14 420 and 3 589; size matches the size spike's decision

## Tasks

- [x] Generate the module from the tooling template
- [x] Write the build script
- [x] Add LICENSE/NOTICE/source.commit
- [x] Add the reproducibility test

## Progress

Created `vsslicer/modules/profiles-data-orca` (version 0.0.0, license AGPL-3.0-only): `data/orca` (14,420 files) and `data/bambu` (3,589 files), byte-identical `.json` copies of `resources/profiles` at Orca 09aa0114 / Bambu 79df7ae (counts equal the spike's). Excluded: png, stl/STL, svg, py, 3mf and one extensionless file (listed in PROVENANCE.md). Also LICENSE (+ LICENSE-OrcaSlicer, LICENSE-BambuStudio), NOTICE, PROVENANCE.md, `source.commit`, `tree.sha256`. `scripts/regenerate.mjs` checks `git rev-parse HEAD` of each clone, refuses symlinks, paths leaving the clone and files over 16 MiB (`scripts/tree.mjs`), runs nothing upstream; two runs give the same hash. `src/index.ts` exports `dataRoot`. Size: about 31 MB unpacked, 13.4 MiB zipped per the spike; no extension here, so no `extensionDependencies`.

Verified in the module: `pnpm lint && pnpm test && pnpm build` pass (8 tests: counts, hash of the committed tree, licence files, SPDX, hash against the clones only when present at the pinned commit, hostile symlink/oversize tests). `node scripts/run.mjs ci` not run (rule 7). Not done: publishing; tar.gz packing (spike follow-up).

### Coordinator: shared-file changes
None (module is new and entirely mine).

Review (sp7-rev-f): FAIL
- `src/index.ts:3`: `dataRoot` is `new URL('../data/', import.meta.url).pathname`, which percent-encodes the path (and gives `/C:/...` on Windows), so the only export is wrong whenever the install path has a space (`C:\Users\John Smith\.vscode\extensions\...`). Repro: copy the module (without node_modules/dist) to a directory named `a b`, `pnpm install && pnpm test`: the two "committed tree" tests fail with `ENOENT ... lstat '.../a%20b'`. Fix: `fileURLToPath(new URL('../data/', import.meta.url))` from `node:url`, and keep a test that resolves `dataRoot` under a path containing a space.
Checked and fine: lint/test/build pass in place (8 tests); in a clean copy without `.reference` (path without a space) 6 pass, the 2 clone tests skip, so the hash test does not need the clones. Every file of `data/orca` (14,420, 24,535,560 B) and `data/bambu` (3,589, 6,821,989 B) has the same sha256 and path as the upstream `resources/profiles/**/*.json` at 09aa0114 / 79df7ae (HEADs verified); no non-JSON, no symlinks; no `.JSON` case variants upstream. LICENSE-OrcaSlicer and LICENSE-BambuStudio are byte-identical to the upstream LICENSE files; NOTICE, PROVENANCE (README line citations checked), `source.commit`, `AGPL-3.0-only` correct; no Prusa data. `pnpm pack --dry-run`: 18,023 files = the two trees, dist (3), the licences, NOTICE, PROVENANCE, README, source.commit, tree.sha256, the two scripts, package.json; nothing extra. regenerate.mjs runs only `git rev-parse`; tree.mjs refuses symlinks (files and dirs), escapes and files over 16 MiB, and the tests prove each. `dist`/`node_modules` are ignored by `vsslicer/.gitignore`.
Notes (not failures): (1) Repo size: the card and US17 ask for the module to contain the trees, so committing them is as intended, but it adds 18,009 files / 31 MB to a repo of 3,364 tracked files (.git 8.8 MB today); git will compress it well (tar.xz 1.2 MB per PRF-22), but every Orca/Bambu bump rewrites thousands of blobs. Alternative for a later card: keep `data/` out of git and generate it at publish from the pinned clones, at the cost of standalone install needing the clones. (2) Shipping `scripts/regenerate.mjs` in the package is harmless but useless to consumers (its default repos path points outside node_modules). (3) The hostile-tree tests leave their `mkdtemp` dirs in the OS tmp dir.

Fix (sp7-prf-41-fix): `src/index.ts` now uses `fileURLToPath(new URL('../data/', import.meta.url))`; new test copies `src/index.ts` into a temp `my module` dir (created and removed by the test) and checks `dataRoot` there; `scripts/regenerate.mjs` dropped from `files` in package.json (file kept); hostile-tree tests now remove their temp dirs. `pnpm lint && pnpm test && pnpm build` pass (9 tests).

Review (sp7-rev3-g): PASS
- Copied the module (no node_modules/dist) to `/private/tmp/claude-501/sp7w.IJ4x/a b/`, `pnpm install --offline` from the local registry, `pnpm test`: 7 pass, 2 clone tests skip (no `.reference` there), including the committed-tree hash tests that failed before. `src/index.ts` uses `fileURLToPath`; new `my module` test passes.
- `pnpm pack --dry-run`: `scripts/regenerate.mjs` no longer packed, `scripts/tree.mjs` still is.
- In place `pnpm lint && pnpm test && pnpm build` pass (9 tests); OS tmp dir has the same entry count before and after the test run (hostile tests clean up).
- Note (not a failure): source files carry `SPDX-License-Identifier: AGPL-3.0-or-later` while package.json and the test say `AGPL-3.0-only`; align one way on a later card.
