---
id: 169
title: "Release `slicer-api@0.3.0`: effect tests for the P2 rows (sequential, mold, conical, overhang, gradual infill, bed mesh, hooks, timelapse, motion keys, tower, purge, per-feature, nozzle map)"
type: chore
priority: P2
effort: XS
model: sonnet
area: [engine]
story: US59
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [161, 162, 163, 164, 165, 166, 167, 168]
created: 2026-10-25
---

Releases `slicer-api@0.3.0` so other modules can depend on the range: effect tests for the P2 rows (sequential, mold, conical, overhang, gradual infill, bed mesh, hooks, timelapse, motion keys, tower, purge, per-feature, nozzle map). Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/common/slicer-api/` (module: `slicer-api`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-api@0.3.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.3.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `node scripts/run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
