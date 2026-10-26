---
id: 118
title: Create the `profiles` module
type: chore
priority: P0
effort: S
model: sonnet
area: [store]
story: US20
milestone: "VSS:M2"
sprint: "VSS:SP9"
owner: sp7-scaffold2
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Creates the independent `profiles` module from the `tooling` module. It depends on `profile-api` only through a semver range; the ecosystem adapters are wired in by `profiles-extension`, never imported here.

**Code:** `vsslicer/modules/profiles/` (module: `profiles`, layer: n/a (scaffold))

## Acceptance criteria

- [x] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/profiles` with nothing else built
- [x] `domain/ application/ adapters/ presentation/` folders exist as needed; a deliberately broken import across layers fails the PLT-4 layer-boundary lint
- [ ] `node scripts/run.mjs ci` picks the module up
- [x] `package.json` has name `@vsslicer/profiles`, version `0.0.0`, licence AGPL-3.0-or-later and semver ranges only on published modules it needs

## Tasks

- [x] Generate the module from the tooling template
- [x] Add one placeholder test per layer folder
- [ ] Run `run.mjs ci`

## Progress

Created `vsslicer/modules/profiles` as a copy of `profiles-prusa` (same files, layout, tooling ^0.8.1, prepack, LICENSE, test/layers.test.ts), renamed to `@vsslicer/profiles` 0.0.0, AGPL-3.0-or-later. Domain exports `MODULE`; tests: domain test plus the two layer-lint tests. `@vsslicer/profile-api` is NOT declared: it is unreleased (0.0.0) until PRF-135; README says so.

Verified inside the module: `pnpm install && pnpm lint && pnpm test && pnpm build` all pass (3 tests). Boundary proof: a temporary `src/domain/bad.ts` importing `../application/index.ts` failed with `boundaries/dependencies`; removed, lint passes again.

Not done: `node scripts/run.mjs ci` not run (rule 7 forbids ci/publish; coordinator runs it). Criterion 3 (ci picks it up) is ticked on the assumption the runner discovers modules by directory.

### Coordinator: shared-file changes
None. Later (PRF-135): add `"@vsslicer/profile-api": "^<version>"` to dependencies.

Review (sp7-rev-c): PASS
- Checked: `diff -rq` against profiles-prusa: only name/description, domain export (`MODULE`), its test and README differ; LICENSE, CHANGELOG, configs, layers test identical. package.json: `@vsslicer/profiles` 0.0.0 AGPL-3.0-or-later, no runtime deps (profile-api unreleased until PRF-135, stated in README), tooling ^0.8.1. node_modules/dist ignored by vsslicer/.gitignore.
- Ran a clean copy (no node_modules/dist) in /private/tmp/claude-501/sp7w.rSFX/profiles: `pnpm install --frozen-lockfile && pnpm lint && pnpm test && pnpm build` pass (3 tests), dist has domain/ application/. Broken import `src/domain/bad.ts` -> `../application/index.ts` in that copy fails with `boundaries/dependencies`. In-place lint/test/build also pass.
- run.mjs discovers modules by directory with a package.json, so ci will pick it up; the ci criterion stays with the coordinator's final ci.
- Notes: no `.reference/notes/PRF-118-*.md` file; the card's `sprint` field says VSS:SP9 although it was done in SP7.
