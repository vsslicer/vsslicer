---
id: 297
title: Export CameraView.open(source) to other extensions
type: feature
priority: P1
effort: S
model: sonnet
area: [camera]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP37"
depends_on: [295]
created: 2026-10-25
---

The exported `CameraView.open(source)` so the fleet view and other extensions can show a camera tile or panel.

**Code:** `vsslicer/modules/apps/camera/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Another test extension calls `open` with a source and gets the panel; the export is typed and the api-extractor report is checked
- [ ] Calling `open` for an unknown source returns a typed error

## Tasks

- [ ] Add the export
- [ ] Write the cross-extension test

## Progress

Not started.
