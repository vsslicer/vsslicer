---
id: 76
title: "Release mesh@0.1.0: benchmark numbers (with VWR-75)"
type: chore
priority: P0
effort: XS
model: sonnet
area: [mesh]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [50, 75]
created: 2026-10-25
---

Releases `mesh@0.1.0`: the benchmark results file the viewer reads its budgets from. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so consumers can depend on the range.

**Code:** `vsslicer/modules/mesh/` (module: `mesh`, layer: n/a (release))

## Acceptance criteria

- [x] `mesh@0.1.0` is in the local registry and its changelog lists the increment
- [x] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [x] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [x] Changelog and version bump
- [x] `run.mjs publish`
- [x] Install check from a scratch consumer

## Progress

- sp11-coordinator: released together with VWR-75 as `@vsslicer/mesh@0.1.0` (rule 21: one version per module per sprint; both increments were ready, so 0.2.0 was not cut): version 0.1.0, `## 0.1.0` CHANGELOG heading over the parsers, stats, BVH, workers, admesh oracle (VWR-45) and benchmark (VWR-50) lines; `test/bench/budget.json` added to `files` so consumers read the budgets. `pnpm test` 90 passed, 1 skipped, and `pnpm build` alone in the module; `run.mjs publish` published 0.1.0 (none before); a scratch project installed `^0.1.0` (`@vsslicer` scope from http://localhost:4873, `three` from npm) and imports 31 exports; `budget.json` is in the package.

Not started.
