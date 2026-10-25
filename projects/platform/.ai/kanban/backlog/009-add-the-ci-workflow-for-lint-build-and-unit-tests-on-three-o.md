---
id: 9
title: "Add the CI workflow: one job per changed module on three operating systems"
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US2
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [8, 4, 1]
created: 2026-10-25
---

One workflow at the repository root (`working-directory: vsslicer`) that starts the local registry and builds and tests each module as its own job, only for changed modules and their dependents. The required check is named `ci` (PLT-1's ruleset). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] The workflow passes on ubuntu, macOS and Windows runners for a clean clone
- [ ] A change to one module runs only that module and its dependents (the selection step prints the list; asserted on a fixture change)
- [ ] Actions are pinned by commit SHA; permissions are read-only by default
- [ ] Concurrency cancels superseded runs

## Tasks

- [ ] Write the workflow and the module selection step
- [ ] Cache the pnpm store per module lockfile
- [ ] Verify on a test branch

## Progress

Not started.
