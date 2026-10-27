---
id: 224
title: Let profiles-data-orca publish on a fresh checkout without .reference
type: bug
priority: P0
effort: S
model: opus
sprint: "VSS:SP14"
owner: PLT-224-worker
created: 2026-10-27
---

Found by PLT-215 (2026-10-27). `profiles-data-orca`'s prepack regenerates its data from the upstream Orca/Bambu profile repos (PRF-190). Two problems:

1. `regenerate.mjs`'s `defaultRepos` points one directory too shallow (`vsslicer/.reference/repos` instead of the repository root's `.reference/repos`); local publishes only work with `VSS_PROFILE_REPOS` set by hand.
2. A GitHub CI checkout has no `.reference` at all (it's ignored), so publishing this module there can't regenerate its data.

Module: `profiles/data-orca` (`@vsslicer/profiles-data-orca`), layer: build/tooling.

Decide and implement: in CI, fetch the pinned upstream repos at their recorded commits (shallow clone of exact commits, read as data, no scripts run: research rules), or skip publishing this module when its version is already on the registry and only build when it changes. Fix the path either way. Version bump if published files change.

Done when: `node scripts/run.mjs ci` publishes `profiles-data-orca` on a clean checkout with no `.reference` and no `VSS_PROFILE_REPOS`, locally and on all three GitHub CI runners.
## Progress

- Design (a), smallest form: `generate.mjs` (prepack) uses a local clone when it exists, else `scripts/fetch.mjs` fetches the pinned commit into `VSS_PROFILE_FETCH_CACHE` (default `<tmpdir>/vsslicer-profile-repos`): git init, sparse-checkout `/resources/profiles/`, `fetch --depth 1 --filter=blob:none <sha>`, checkout. git only, no upstream script runs; the existing commit check and `tree.sha256` check still gate the copy, so a stale or tampered cache fails. A cache dir not at the pinned head is deleted and refetched. Why not (b): nothing depends on this module (only tooling's licence check names it), but CI's Verdaccio is fresh every run, so "skip if published" never applies there, and committing the data is ruled out by Q21. Fetch cost measured: Orca 29 MB .git / 6 s, Bambu 14 MB / 2 s (about 175 MB on disk with checkout).
- `defaultRepos` fixed (`../../../../.reference/repos`); this enables the previously always-skipped "pinned clones" test locally, which hashes ~14k files, so it gets a 60 s timeout.
- ci.yml: `actions/cache` (same SHA as the others) on `runner.temp/profile-repos`, key `profile-repos-<hashFiles(source.commit)>`, only when `@vsslicer/profiles-data-orca` is selected; `VSS_PROFILE_FETCH_CACHE` passed to `run.mjs ci`. Windows: `core.longpaths` set in the fetched clone.
- Tests: `test/fetch.test.ts` fetches from a local file:// upstream (sparse: a file outside resources/profiles stays out), reuses the cache, replaces a non-clone dir, and `generate` fetches a missing clone.
- Verification: module `pnpm test` 22/22, `pnpm lint` clean. Full `node scripts/run.mjs ci` against a fresh, empty Verdaccio (owner's storage set aside and restored after) with `VSS_PROFILE_REPOS` = empty dir and an empty fetch cache: exit 0, fetched both repos and published profiles-data-orca 0.1.0. Runner tests: 122 pass, 1 fail (the known "no cache step for fixtures nothing generates", not touched).
- Release: published files unchanged (fetch.mjs is not in `files`); the freshly fetched tarball's integrity equals the one already in the registry (sha512-sRA7XWd0...), so no version bump, no CHANGELOG entry, no re-lock. `version-check --base HEAD` ok.
- Not verified: the GitHub runners themselves (Windows long paths, runner network); first push will show.
