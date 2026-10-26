---
id: 471
title: Skip publishing unreleased 0.0.0 modules in run.mjs
type: chore
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-runner
created: 2026-10-26
---

`node scripts/run.mjs ci` and `publish` publish every module at whatever version it has, so a clean-registry ci publishes unreleased `0.0.0` modules (SP6 left `mesh@0.0.0` and `profile-api@0.0.0` in the local registry). A `0.0.0` module is unreleased by definition (module cards create them at 0.0.0) and no module may depend on it.

**Code:** `vsslicer/scripts/run.mjs` and `vsslicer/scripts/test/` (module: scripts runner, layer: n/a (tooling))

## Acceptance criteria

- [x] `publish` (alone and inside `ci`) skips a module whose version is `0.0.0` with a log line saying it is unreleased
- [x] `ci` fails with a named error when a module declares a dependency on a `@vsslicer/*` module that is at `0.0.0`
- [x] Runner tests cover both (`cd vsslicer/scripts && node --test test/`)

## Tasks

- [x] Skip and guard in run.mjs, tests

## Progress

Done. `lib.mjs`: `isUnreleased`, `unreleasedDepProblems`. `run.mjs`: `publish` (alone and in `ci`) logs "0.0.0 is unreleased, skipping publish" and returns before the registry is contacted; `ci` exits 1 with `ci: <a> depends on <b>, which is at unreleased version 0.0.0` for any selected module (incl. pulled-in deps) depending on a 0.0.0 module. Tests added to `scripts/test/lib.test.mjs`. Verified: `cd vsslicer/scripts && node --test test/` 71 pass, 0 fail. The run.mjs wiring itself is not run (would hit the registry). Files not prettier-formatted (existing files already fail prettier --check).

### Coordinator: shared-file changes
None.

Review (sp7-rev-b): PASS. Ran `cd vsslicer/scripts && node --test test/`: 73 pass, 0 fail. Read the diff: publish() returns on 0.0.0 before published()/fetchRetry, so no registry call (covers `publish` and `ci`); the ci guard runs before the install loop over selected modules plus their pulled-in deps (withDeps), and localDeps reads dependencies, devDependencies and peerDependencies. Scratch script over the real modules/ list via lib.mjs: unreleased = mesh, profile-api, profiles-cura, profiles-orca, profiles-prusa; problems = [] (current repo passes); a synthetic dependency on a 0.0.0 module is caught in each of the three fields. Prettier: `git show HEAD:` versions of lib.mjs and test/lib.test.mjs already fail prettier --check, so not counted. Not run: run.mjs ci/publish (rules). Minor: optionalDependencies is not checked (pre-existing localDeps; no module uses it).
