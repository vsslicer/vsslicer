---
id: 254
title: Create the `camera-mjpeg` module
type: chore
priority: P1
effort: S
model: sonnet
area: [camera]
story: US42
milestone: "VSS:M4"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/camera-mjpeg/`: the HTTP camera sources (MJPEG and snapshot polling) of Moonraker, OctoPrint, PrusaLink and manual URLs.

**Code:** `vsslicer/modules/camera-mjpeg/` (module: `camera-mjpeg`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/camera-mjpeg`, own lockfile, changelog, version 0.0.1)
- [ ] Layer-boundary lint on; `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add config and a smoke test

## Progress

Not started.
