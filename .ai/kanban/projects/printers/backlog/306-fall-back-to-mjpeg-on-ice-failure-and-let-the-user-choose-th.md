---
id: 306
title: Fall back to MJPEG on ICE failure and let the user choose the transport
type: feature
priority: P2
effort: S
model: sonnet
area: [camera]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP38"
depends_on: [305]
created: 2026-10-25
---

When ICE fails or times out, switch to the descriptor's MJPEG fallback with a visible note; a setting pins a camera to MJPEG.

**Code:** `vsslicer/modules/apps/camera/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With UDP blocked in the test (no candidates), the player shows MJPEG and the note within the timeout, never a blank player
- [ ] The per-camera setting forces MJPEG and survives reload

## Tasks

- [ ] Add the ICE timeout and note
- [ ] Add the setting
- [ ] Write the fallback test

## Progress

Not started.
