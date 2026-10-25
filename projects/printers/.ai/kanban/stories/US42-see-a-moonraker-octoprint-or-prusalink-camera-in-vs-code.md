---
id: US42
title: "See a Moonraker, OctoPrint or PrusaLink camera in VS Code"
status: reviewed
epic: VSS:E38
---

As a user of a Klipper, OctoPrint or PrusaLink printer, I want to open its camera from the Printers tree in a panel, save a snapshot to a file and let other extensions embed the view, so that I can watch my print without a browser tab.

## Acceptance criteria

- [ ] `mjpeg` and `jpeg-poll` cameras come from Moonraker `/server/webcams/list`, OctoPrint settings URLs, PrusaLink `/api/v1/cameras/{id}/snap` and a manual URL
- [ ] Open camera in the Printers tree opens the panel (a picker when there are several cameras); the sidebar view lists them
- [ ] The webview has a meta CSP with `default-src 'none'` and only the proxy origin, no `unsafe-inline`
- [ ] Save snapshot writes the current frame to a file
- [ ] `CameraView.open(source)` is exported for other extensions
- [ ] Tested on the local MJPEG and snapshot servers and recorded camera lists only (D5)

## Out of scope

- WebRTC and timelapses (E39)
- Prusa Connect cameras and recording
