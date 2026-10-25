---
id: 296
title: Save a snapshot to a file
type: feature
priority: P1
effort: S
model: sonnet
area: [camera]
story: US42
milestone: "VSS:M4"
depends_on: [295]
created: 2026-10-25
---

A 'Save snapshot' command on the panel that writes the current frame as a JPEG to a chosen file.

**Code:** `vsslicer/modules/camera-extension/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The saved file is a whole JPEG equal to the served frame (hash test against the snapshot server)
- [ ] Cancelling the save dialog writes nothing; a write error is shown

## Tasks

- [ ] Add the command
- [ ] Write the test

## Progress

Not started.
