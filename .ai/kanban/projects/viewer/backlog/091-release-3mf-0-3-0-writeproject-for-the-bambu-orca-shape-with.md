---
id: 91
title: "Release `3mf@0.3.0`: writeProject for the Bambu/Orca shape with change tracking and atomic save"
type: chore
priority: P1
effort: XS
model: sonnet
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [87, 88, 89, 90]
created: 2026-10-25
---

Releases `3mf@0.3.0`: `writeProject`, change tracking, stale-artefact removal and the atomic package sink. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so consumers can depend on the range.

**Code:** `vsslicer/modules/core/3mf/` (module: `3mf`, layer: n/a (release))

## Acceptance criteria

- [ ] `3mf@0.3.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.3.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
