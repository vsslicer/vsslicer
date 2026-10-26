---
id: 76
title: "Release mesh@0.2.0: benchmark numbers"
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

Releases `mesh@0.2.0`: the benchmark results file the viewer reads its budgets from. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so consumers can depend on the range.

**Code:** `vsslicer/modules/mesh/` (module: `mesh`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.2.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
