---
id: 310
title: Download timelapses to the workspace or a folder and open them in the media preview
type: feature
priority: P2
effort: M
model: sonnet
area: [camera, storage]
story: US48
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [309, 162, 339]
created: 2026-10-25
---

Download with progress and cancel through E24's download path (large-download prompt and folder streaming of `vsslicer.printers`), then 'Open' in VS Code's media preview.

**Code:** `vsslicer/modules/camera-extension/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Download to a workspace folder and to a chosen folder with a progress notification; cancel removes the partial file
- [ ] Open in media preview works for a playable fixture; an unplayable one downloads with the note

## Tasks

- [ ] Add the download command
- [ ] Reuse the E24 prompt and streaming
- [ ] Write tests

## Progress

Not started.
