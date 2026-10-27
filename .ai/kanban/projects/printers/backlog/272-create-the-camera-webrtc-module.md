---
id: 272
title: Create the `camera-webrtc` module
type: chore
priority: P2
effort: S
model: sonnet
area: [camera]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP37"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/camera/webrtc/`: WebRTC camera sources (go2rtc WebSocket signalling and WHEP).

**Code:** `vsslicer/modules/camera/webrtc/` (module: `camera-webrtc`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/camera-webrtc`, own lockfile, changelog, version 0.0.1)
- [ ] Layer-boundary lint on; `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add config and a smoke test

## Progress

Not started.
