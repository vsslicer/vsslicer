---
id: 23
title: Create the vsslicer extension pack skeleton
type: feature
priority: P0
effort: S
model: sonnet
area: [publishing]
story: US5
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [21]
created: 2026-10-25
---

Module: `pack` (`vsslicer/modules/pack`), the extension pack, packaged by the tooling package helper. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] `modules/pack` packages to a VSIX through its own `pnpm package` (the tooling helper)
- [ ] `extensionPack` is generated from a list of shipped extension ids; adding `vsslicer.gcode` is a one-line change
- [ ] Pack passes the licence and content checks

## Tasks

- [ ] Create the package
- [ ] Add generation of `extensionPack`
- [ ] Write the README

## Progress

Not started.
