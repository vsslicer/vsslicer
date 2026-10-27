---
id: 381
title: "Release `mesh@0.8.0`: measure features and auto-orient"
type: chore
priority: P2
effort: XS
model: sonnet
area: [mesh]
story: US97
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [373, 379, 380]
created: 2026-10-25
---

Releases `mesh@0.8.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/core/mesh/` (module: `mesh`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh@0.8.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
