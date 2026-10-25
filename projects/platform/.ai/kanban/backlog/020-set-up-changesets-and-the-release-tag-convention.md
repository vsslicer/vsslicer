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
depends_on: [9]
created: 2026-10-25
---

Each module carries its own version and `CHANGELOG.md` and releases as `<name>@x.y.z`. Changesets assumes one workspace, so the rule is enforced by a small check in `tooling` instead. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] A change to a module's published files without a version bump and a `CHANGELOG.md` entry is flagged by a CI step (docs-only changes exempt)
- [ ] A version bump of `example-extension` produces its `CHANGELOG.md` entry and an `example-extension@x.y.z` tag in a dry run
- [ ] `scripts/run.mjs ci` fails, naming both modules, when a dependent's lockfile integrity for an `@vsslicer/*` dependency differs from the tarball the registry serves (published content changed without a bump; the pnpm store masks this locally, a clean CI store does not)
- [ ] Modules publish only to the registry their `.npmrc` names (the local registry until D10's registries exist); nothing publishes to npmjs

## Tasks

- [ ] Write the bump check and the tag dry run
- [ ] Wire the check into CI
- [ ] Document the rule in `CONTRIBUTING.md`

## Progress

Not started.
