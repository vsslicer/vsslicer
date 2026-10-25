---
id: 54
title: "Release `slicer-output@0.1.0`: thumbnail encoders and blocks, and `.gcode.3mf` assembly"
type: chore
priority: P0
effort: XS
model: sonnet
area: [engine]
story: US10
milestone: "VSS:M3"
depends_on: [48, 52, 53]
created: 2026-10-25
---

Releases `slicer-output@0.1.0` so other modules can depend on the range: thumbnail encoders and blocks, and `.gcode.3mf` assembly. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer-output/` (module: `slicer-output`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-output@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
