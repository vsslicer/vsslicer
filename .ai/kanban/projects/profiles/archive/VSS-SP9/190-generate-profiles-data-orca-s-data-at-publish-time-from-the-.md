---
id: 190
title: "Generate profiles-data-orca's data at publish time from the pinned upstream commit"
type: feature
priority: P1
effort: M
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
created: 2026-10-26
---

Q21 (answered: "Generate at publish time from a pinned upstream commit, and remove the files from history before the first push"): profiles-data-orca stops tracking its 18,009 upstream JSON files. `data/` is generated before pack from the pinned upstream commit in `source.commit`, and checked against `tree.sha256`. History is NOT rewritten in this card (that is a separate step at push time, with Q12).

**Code:** `vsslicer/modules/profiles-data-orca/scripts/` and tests (module: `profiles-data-orca`, layer: tooling scripts)

## Acceptance criteria

- [ ] A script `scripts/generate.mjs` copies the profile trees from an OrcaSlicer and a Bambu Studio checkout at the commits in `source.commit` (path from an env var or argument, default `.reference/repos/<name>`) into `data/`, verifies the commit with `git rev-parse HEAD` read-only, and verifies the result against `tree.sha256`; it fails with a named error on a commit or hash mismatch
- [ ] `data/` is listed in the module's `.gitignore`; `prepack` runs the generator then the build (the coordinator edits package.json and does the `git rm --cached`)
- [ ] Tests that read `data/` skip with a stated reason when it is absent, and a small committed fixture tree covers the generator
- [ ] **Bounds:** the generator refuses symlinks, paths that leave the source or target roots, more than 50,000 files, a file over 16 MiB and a total over 256 MiB, each with a test on a scratch tree
- [ ] Never runs upstream build scripts or interpreters; reads files only

## Progress

Added `scripts/generate.mjs` (+ `.d.mts`): `readPins()` parses source.commit and tree.sha256; `generate({repos,outDir,...})` checks each clone with `git rev-parse HEAD` (via regenerate.mjs `headOf`), lists json, stages into `data.tmp`, verifies the sha256 per tree, then swaps into `data/` (failed run leaves no data/). Repo dir from argv, `VSS_PROFILE_REPOS`, `VSS_REPO_<REPO>`, default `.reference/repos`. Named errors: "commit mismatch", "tree hash mismatch". `scripts/tree.mjs` `listJson` gained `maxFiles` (50,000) and `maxTotal` (256 MiB) next to the 16 MiB file cap and the existing symlink/escape refusals; generate also checks the target path and the cross-tree file total. `regenerate.mjs` kept (it rewrites the pins). New `.gitignore` with `data/`. `test/data.test.ts`: the data-reading block skips when data/ is absent (licence/commit checks split out and always run). New `test/generate.test.ts` with committed fixture `test/fixture/Repo/...`: copy+hash, commit mismatch, hash mismatch, symlink file/dir, file count, file size, total size, cross-tree count.
Verified: `pnpm test` 17 passed, `pnpm lint` clean, `node scripts/run.mjs checks` clean; real generation from `.reference/repos` into a scratch dir gave 14420 + 3589 files and passed both hashes. Not done: package.json edits, git rm --cached, history rewrite.

Coordinator package.json lines:
- `"prepack": "node scripts/generate.mjs && pnpm build"`
- `"generate": "node scripts/generate.mjs"`
- in `files`: add `"scripts/generate.mjs"` and `"scripts/regenerate.mjs"` is NOT needed; generate.mjs imports `./regenerate.mjs` and `./tree.mjs`, so only matters if shipped: leave `files` as is (generate is a publish-time tool, not shipped).
(Tests run with data/ present or absent.)

- [x] all criteria met (package.json/untrack left to coordinator)

**Review failed (sp9-rev-prf-190)**

Ran: `pnpm test` (17 passed), `pnpm lint` clean, `pnpm build` clean, `node scripts/run.mjs checks` exit 0. Real generation from `.reference/repos` (both clones at the pinned commits) into a mktemp dir: 14420 + 3589 = 18009 files, both tree hashes match `tree.sha256`; a forced wrong HEAD fails with "commit mismatch". With data/ absent, data.test.ts gives 5 passed / 4 skipped. Only process run is `git -C <clone> rev-parse HEAD` (execFileSync, no shell); nothing from `.reference` is executed. No wall-clock asserts. Probes and a mutated module copy lived in a mktemp dir, now deleted.

Problems:
1. `scripts/generate.mjs:41` and `scripts/tree.mjs:17-41`: the 256 MiB total is enforced per tree only, so two trees together can exceed it. Probe: two trees of 30 bytes each, `maxTotal: 50`, generate accepted 60 bytes. Expected fix: keep a running byte total across trees in generate (sum the sizes of the listed files, the same way `total` at :48/:57 sums file counts) and throw `total over <maxTotal> bytes` before copying; add a test with two pins.
2. `scripts/tree.mjs:17`: `listJson` calls realpath on the root and then walks it, so a symlinked `resources/profiles` (or `resources`) that points outside the clone is accepted and read. Probe: `<clone>/resources/profiles -> /outside`, generate copied it. Expected fix: in generate, refuse when `realpathSync(root)` is not under `realpathSync(clone)` (or lstat each component below the clone and refuse a symlink); add a test.
3. `test/generate.test.ts:70` ("across all trees") uses a single pin, so the per-tree `listJson` cap throws first and the cross-tree check at `generate.mjs:57-58` never runs. Mutation check: deleting line 58 leaves all 8 generate tests passing. Expected fix: use two pins whose counts are each under `maxFiles` but whose sum is over it.

Note, not a blocker: the data/ skip reason is only a code comment (`test/data.test.ts:31`); vitest's skip output doesn't show it.

**Fix round (sp9-prf-190-fix)**

1. `generate.mjs` now keeps running file and byte totals across trees (sizes via statSync) and throws `more than N files in total` / `total over N bytes` in the staging phase, before anything is copied. Tests: two pins (2 files each, `maxFiles: 3`) reach the cross-tree check; two pins with `maxTotal` = one tree + 1 byte; both assert no `data/` and no `data.tmp`.
2. `generate.mjs` refuses a profiles root whose realpath is not under the clone's realpath (`profiles root leaves the clone`). Test: `resources/profiles` replaced by a symlink to a scratch dir.
3. The old single-pin "across all trees" test is replaced by the two-pin one above.
4. data/-absent skip reason is now in the describe title, so vitest shows it.
Verified: `pnpm test` 19 passed, `pnpm lint` clean, `node scripts/run.mjs checks` exit 0. The CLI was not run against the module's data/.

**Review passed (sp9-rerev-prf-190)**

Ran in the module: `pnpm test` 19 passed (data/ present), `pnpm lint` clean, `pnpm build` clean. `node scripts/run.mjs checks` exit 1, only from check-licence on `profile-catalogue-data` (13 SPDX header problems, another card's untracked module); nothing for profiles-data-orca. Real generation from `.reference/repos` into a mktemp dir (not the module's data/): OrcaSlicer 14420 + BambuStudio 3589 files, both hashes match `tree.sha256`.

The three earlier problems, checked by mutation in a mktemp copy of the module (data/ excluded):
1. Cross-tree byte total: `scripts/generate.mjs:51-52` sums sizes in the staging map, before any copy. Deleting :52, or :51-52, fails "refuses more bytes than the cap across all trees, before copying".
2. Symlinked profiles root: `generate.mjs:44-46` compares realpaths. Deleting :46 fails "refuses a profiles root that is a symlink leaving the clone". A probe with `<clone>/resources` (the parent) symlinked outside also gets "profiles root leaves the clone"; a missing clone fails with ENOENT.
3. Two-pin file count: deleting `generate.mjs:50` fails "refuses more files than the cap across all trees" (2+2 files, cap 3).
Rest of the card: still holds. `.gitignore` has `data/`; the data/ skip reason is in the describe title; the only process run is `git rev-parse HEAD`; no wall-clock asserts. Probes and the copy were deleted.

Note, not a blocker: when I delete the per-tree early-exit caps in `scripts/tree.mjs` (`out.length >= maxFiles`, `total > maxTotal`), all tests still pass, because the cross-tree checks in generate give the same errors. The bound still holds, but a huge tree is walked in full before it is refused. A direct `listJson` test with a small `maxFiles` would pin it down.
