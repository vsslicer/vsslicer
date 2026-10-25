---
id: 313
title: Write the bench script for latency and bandwidth per stream type
type: chore
priority: P2
effort: M
model: sonnet
area: [camera]
story: US49
milestone: "VSS:M4"
depends_on: [301, 306, 298]
created: 2026-10-25
---

A repeatable bench for MJPEG, frames, MSE and WebRTC: glass-to-glass latency with a timestamped test source, and bandwidth at the proxy.

**Code:** `vsslicer/modules/camera-extension/` (module: `camera-extension`, layer: `n/a (bench)`)

## Acceptance criteria

- [ ] Runs against the local servers and prints a table with the stream type, latency, bandwidth, hardware and date
- [ ] Re-running on the same machine gives results within a stated tolerance

## Tasks

- [ ] Write the timestamped source
- [ ] Write the runner and table

## Progress

Not started.
