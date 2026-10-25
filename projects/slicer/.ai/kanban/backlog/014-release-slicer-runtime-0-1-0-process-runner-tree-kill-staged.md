---
id: 14
title: "Release `slicer-runtime@0.1.0`: process runner, tree-kill, staged output, verified download and archive extraction"
type: chore
priority: P0
effort: XS
model: sonnet
area: [engine]
story: US5
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [9, 10, 11, 12, 13]
created: 2026-10-25
---

Releases `slicer-runtime@0.1.0` so other modules can depend on the range: process runner, tree-kill, staged output, verified download and archive extraction. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer-runtime/` (module: `slicer-runtime`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-runtime@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
