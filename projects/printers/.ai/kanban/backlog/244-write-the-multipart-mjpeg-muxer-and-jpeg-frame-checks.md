---
id: 244
title: Write the multipart MJPEG muxer and JPEG frame checks
type: feature
priority: P1
effort: S
model: sonnet
area: [camera]
story: US40
milestone: "VSS:M4"
depends_on: [241]
created: 2026-10-25
---

Pure helpers for turning JPEG frames into a `multipart/x-mixed-replace` stream and for checking a buffer is a whole JPEG, used by the agent proxy and the Bambu frame source.

**Code:** `vsslicer/modules/camera-api/src/domain/...` (module: `camera-api`, layer: `domain`)

## Acceptance criteria

- [ ] Muxer output parses back to the same frames with a reference multipart parser in the test
- [ ] A truncated or non-JPEG buffer is rejected by the check (unit tests for SOI/EOI and zero length)
- [ ] No Node-only API in the domain code (works on Buffers and Uint8Array)

## Tasks

- [ ] Write the muxer
- [ ] Write the frame check
- [ ] Write tests

## Progress

Not started.
