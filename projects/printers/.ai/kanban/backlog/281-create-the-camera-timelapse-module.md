---
id: 281
title: Create the `camera-timelapse` module
type: chore
priority: P2
effort: S
model: sonnet
area: [camera]
story: US46
milestone: "VSS:M4"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/camera-timelapse/`: timelapse providers for the open printer families (Moonraker, OctoPrint), kept apart from the Bambu provider (FTPS) and the MJPEG cameras.

**Code:** `vsslicer/modules/camera-timelapse/` (module: `camera-timelapse`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/camera-timelapse`, own lockfile, changelog, version 0.0.1)
- [ ] Layer-boundary lint on; `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add config and a smoke test

## Progress

Not started.
