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
depends_on: [3, 4]
created: 2026-10-25
---

Module: `tooling` (checks). Each module is its own pnpm project, so an undeclared import must fail that module's build. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] A fixture module `vsslicer/fixtures/phantom-dep` importing an undeclared package makes its `pnpm build` fail with the package named
- [ ] The negative test runs from `scripts/run.mjs` (and so in CI) and passes when the fixture's build fails
- [ ] Every module's `.npmrc` keeps pnpm's strict settings (no `shamefully-hoist`), asserted by a test over all modules

## Tasks

- [ ] Create the fixture and its `PROVENANCE.md`
- [ ] Write a script that expects failure
- [ ] Add it to the root `test` task

## Progress

Not started.
