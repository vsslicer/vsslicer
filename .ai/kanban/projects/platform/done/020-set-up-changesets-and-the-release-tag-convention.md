---
id: 20
title: Set up per-module versioning and the release-tag convention
type: feature
priority: P0
effort: S
model: sonnet
area: [publishing]
story: US5
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-20-worker
depends_on: [9]
created: 2026-10-25
---

Each module carries its own version and `CHANGELOG.md` and releases as `<name>@x.y.z`. Changesets assumes one workspace, so the rule is enforced by a small check in `tooling` instead. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [x] A change to a module's published files without a version bump and a `CHANGELOG.md` entry is flagged by a CI step (docs-only changes exempt)
- [x] A version bump of `example-extension` produces its `CHANGELOG.md` entry and an `example-extension@x.y.z` tag in a dry run
- [x] `scripts/run.mjs ci` fails, naming both modules, when a dependent's lockfile integrity for an `@vsslicer/*` dependency differs from the tarball the registry serves (published content changed without a bump; the pnpm store masks this locally, a clean CI store does not)
- [x] Modules publish only to the registry their `.npmrc` names (the local registry until D10's registries exist); nothing publishes to npmjs

## Tasks

- [x] Write the bump check and the tag dry run
- [x] Wire the check into CI
- [x] Document the rule in `CONTRIBUTING.md`

## Progress

Done locally (the CI step can't run without a remote, Q7; it is wired in `ci.yml`). Changesets doesn't fit independent modules, so the rule is enforced by `vsslicer/scripts/versioning.mjs`. Verified: runner tests 35/35, `node scripts/run.mjs checks` passes.

- `node scripts/run.mjs version-check --base <ref>`: a module whose published files changed (non-test `src/`, `files` entries honouring `!`, `package.json`) must have a different version than at base and a `## x.y.z` CHANGELOG entry; tests, fixtures, `docs/` and Markdown are exempt; a new module needs only the entry; failures name the module. Wired into `ci.yml`'s `select` job against the PR base (push: `github.event.before`).
- `node scripts/run.mjs release --dry-run <module>` prints the CHANGELOG section and `tag: <name>@x.y.z` (e.g. `example-extension@0.4.0`) and creates nothing.
- Lockfile-integrity guard at the end of `ci`: every `@vsslicer/*` integrity in each selected module's lockfile must equal the registry's `dist.integrity`; mismatch fails naming both modules (tested with a doctored lockfile).
- Registry check in `checks`: `publishConfig.registry` and `.npmrc` point at `http://localhost:4873/`; no `registry.npmjs.org` for `@vsslicer`.
- `run.mjs` skips a `modules/<dir>` without `package.json` with a warning (integration test).
- Limits: any `package.json` change counts as published (a devDependency-only edit needs a bump); `files` globs support `*` and `**` only; real tag creation isn't implemented (release workflow is PLT-25).

Files: `vsslicer/scripts/{versioning.mjs,run.mjs,test/versioning.test.mjs}`, `.github/workflows/ci.yml`, `CONTRIBUTING.md`.
