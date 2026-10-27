---
id: 295
title: "Add the camera panel, sidebar view and Open camera in the Printers tree"
type: feature
priority: P1
effort: M
model: sonnet
area: [camera]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP39"
depends_on: [293, 294, 28, 339]
created: 2026-10-25
---

The panel and sidebar view, an 'Open camera' action on a printer in the Printers tree (camera picker when there are several), reached through the proxy with `asExternalUri`/`portMapping`.

**Code:** `vsslicer/modules/apps/camera/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Open camera on a printer with two cameras asks which; one camera opens directly; closing the panel closes the stream (agent socket count)
- [ ] The proxy URL is mapped with `asExternalUri`; the panel works with the local MJPEG test server in the extension test host
- [ ] Printers without cameras hide the action

## Tasks

- [ ] Add the commands and menus
- [ ] Add the panel and sidebar view
- [ ] Write extension tests

## Progress

Not started.
