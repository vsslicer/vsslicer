---
id: 243
title: "Add the local MJPEG, snapshot and restartable test servers"
type: chore
priority: P1
effort: M
model: sonnet
area: [camera]
story: US40
milestone: "VSS:M4"
depends_on: [242]
created: 2026-10-25
---

The deterministic local servers D5 requires: every camera module and the agent test against them instead of real cameras.

**Code:** `vsslicer/modules/camera-api/` (module: `camera-api`, layer: `n/a (test kit)`)

## Acceptance criteria

- [ ] An MJPEG multipart server (configurable frame rate and recorded JPEG frames), a snapshot server, and an auth mode (basic, header token) that answers 401 on a wrong credential
- [ ] Each server can be stopped and restarted on the same port from a test, and can drop the connection mid-frame
- [ ] Binds 127.0.0.1 on a random port; servers are exported from the test-kit entry point and used in one self-test

## Tasks

- [ ] Write the servers and the control handle
- [ ] Add the recorded JPEG frames with PROVENANCE.md
- [ ] Write the self-test

## Progress

Not started.
