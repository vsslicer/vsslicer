---
id: 327
title: "Release `mesh-boolean@0.1.0`: boolean and planar cut in a worker"
type: chore
priority: P2
effort: XS
model: sonnet
area: [mesh]
story: US87
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [323, 324, 325, 326, 320]
created: 2026-10-25
---

Releases `mesh-boolean@0.1.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/mesh-boolean/` (module: `mesh-boolean`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh-boolean@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
