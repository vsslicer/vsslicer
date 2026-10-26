---
id: 75
title: "Release mesh@0.1.0: parsers, stats, BVH and workers"
type: chore
priority: P0
effort: XS
model: sonnet
area: [mesh]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [47, 48, 49]
created: 2026-10-25
---

Releases `mesh@0.1.0`: STL and OBJ parsers, statistics, BVH and both worker adapters. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so consumers can depend on the range.

**Code:** `vsslicer/modules/mesh/` (module: `mesh`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
