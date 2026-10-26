---
id: 355
title: "Release `mesh@0.7.0`: layer-height profiles: adaptive, smooth and brush maths"
type: chore
priority: P2
effort: XS
model: sonnet
area: [mesh]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [349, 351, 352, 353, 354]
created: 2026-10-25
---

Releases `mesh@0.7.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/mesh/` (module: `mesh`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh@0.7.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
