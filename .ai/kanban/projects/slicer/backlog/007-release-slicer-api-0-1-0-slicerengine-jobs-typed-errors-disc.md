---
id: 7
title: "Release `slicer-api@0.1.0`: SlicerEngine, jobs, typed errors, discovery types and the fake engine"
type: chore
priority: P0
effort: XS
model: sonnet
area: [engine]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [3, 4, 5, 6]
created: 2026-10-25
---

Releases `slicer-api@0.1.0` so other modules can depend on the range: SlicerEngine, jobs, typed errors, discovery types and the fake engine. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-api@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
