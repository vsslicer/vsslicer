---
id: 334
title: "Release `mesh-boolean@0.2.0`: connectors, dovetail, cut identity and paint carry"
type: chore
priority: P2
effort: XS
model: sonnet
area: [mesh]
story: US89
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [330, 332, 333, 327]
created: 2026-10-25
---

Releases `mesh-boolean@0.2.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/mesh-boolean/` (module: `mesh-boolean`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh-boolean@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
