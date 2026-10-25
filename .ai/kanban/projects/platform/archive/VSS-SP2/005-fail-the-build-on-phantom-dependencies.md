---
id: 5
title: Fail the build on phantom dependencies
type: feature
priority: P0
effort: S
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-5-worker
depends_on: [3, 4]
created: 2026-10-25
---

Module: `tooling` (checks). Each module is its own pnpm project, so an undeclared import must fail that module's build. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [x] A fixture module `vsslicer/fixtures/phantom-dep` importing an undeclared package makes its `pnpm build` fail with the package named
- [x] The negative test runs from `scripts/run.mjs` (and so in CI) and passes when the fixture's build fails
- [x] Every module's `.npmrc` keeps pnpm's strict settings (no `shamefully-hoist`), asserted by a test over all modules

## Tasks

- [x] Create the fixture and its `PROVENANCE.md`
- [x] Write a script that expects failure
- [x] Add it to the root `test` task

## Progress

Done. No root workspace, so "root test task" is `node scripts/run.mjs checks`, which `ci` runs after the module loop (so CI runs it). Verified: runner tests 20/20; `node scripts/run.mjs ci` exits 0 including the checks.

- `vsslicer/fixtures/phantom-dep`: TS fixture importing `eslint` (installed elsewhere, undeclared); `tsc` fails with `TS2307: Cannot find module 'eslint'`. Outside `modules/`, so never built as a module; own lockfile, `.npmrc`, `PROVENANCE.md`.
- `scripts/test/phantom-dep.test.mjs`: frozen install then build of the fixture; passes only if the build fails naming `eslint`.
- `scripts/test/npmrc.test.mjs`: for every module and the fixture, rejects `shamefully-hoist`, `node-linker` hoisted/pnp and any `public-hoist-pattern` in `.npmrc` and `pnpm-workspace.yaml` (kebab and camel case); and asserts `node_modules` top level holds only declared dependencies (pnpm 11's strict defaults, observed). Proven by adding `shamefully-hoist=true` to `modules/example/.npmrc` (failed; restored).
- Covers PLT-4's known gap: an undeclared, unresolvable import is skipped by `import-x/no-extraneous-dependencies` but fails the build here.
- Coordinator added the `checks` line to `CONTRIBUTING.md`.

Files: `vsslicer/scripts/run.mjs`, `vsslicer/scripts/test/{phantom-dep,npmrc}.test.mjs`, `vsslicer/fixtures/phantom-dep/*`, `CONTRIBUTING.md`.
