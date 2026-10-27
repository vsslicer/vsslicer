---
id: 299
title: "Release `3mf@0.7.0`: layer-height and cut information round trips"
type: chore
priority: P2
effort: XS
model: sonnet
area: [3mf]
story: US94
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [297, 298, 296]
created: 2026-10-25
---

Releases `3mf@0.7.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/core/3mf/` (module: `3mf`, layer: n/a (release))

## Acceptance criteria

- [ ] `3mf@0.7.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
