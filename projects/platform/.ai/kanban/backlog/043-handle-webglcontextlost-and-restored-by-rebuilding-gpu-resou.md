---
id: 43
title: Handle webglcontextlost and restored by rebuilding GPU resources
type: feature
priority: P0
effort: M
model: sonnet
area: [webview-kit]
story: US9
milestone: "VSS:M1"
depends_on: [41, 42]
created: 2026-10-25
---

A resource registry rebuilds buffers and textures from CPU-side arrays on `webglcontextrestored`.

## Acceptance criteria

- [ ] `loseContext()` then `restoreContext()` redraws a snapshot-identical image without a new host message
- [ ] Test asserts no host message sent between lose and restore
- [ ] CPU arrays remain referenced only while registered (no leak after dispose)

## Tasks

- [ ] Implement the registry
- [ ] Hook the events
- [ ] Test with `WEBGL_lose_context`

## Progress

Not started.
