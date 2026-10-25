---
id: 241
title: Create the `camera-api` module
type: chore
priority: P1
effort: S
model: sonnet
area: [camera, api]
story: US40
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/camera-api/` from the `tooling` module: the small shared boundary for camera stream types, the contract kit and the pure helpers the camera modules share.

**Code:** `vsslicer/modules/camera-api/` (module: `camera-api`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/camera-api`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json, tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.
