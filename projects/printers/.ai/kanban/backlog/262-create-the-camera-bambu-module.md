---
id: 262
title: Create the `camera-bambu` module
type: chore
priority: P1
effort: S
model: sonnet
area: [camera, bambu]
story: US43
milestone: "VSS:M4"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/camera-bambu/`: the Bambu camera sources (pushed JPEG frames on port 6000 for A1/P1, RTSPS for X1, P2S and H2) and later the SD-card timelapse provider.

**Code:** `vsslicer/modules/camera-bambu/` (module: `camera-bambu`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/camera-bambu`, own lockfile, changelog, version 0.0.1)
- [ ] Layer-boundary lint on; `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add config and a smoke test

## Progress

Not started.
