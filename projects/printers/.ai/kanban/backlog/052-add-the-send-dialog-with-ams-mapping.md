---
id: 52
title: Add the send dialog with AMS mapping
type: feature
priority: P1
effort: M
model: sonnet
area: [bambu]
story: US10
milestone: "VSS:M3"
depends_on: [51, 50, 48]
created: 2026-10-25
---

A quick-pick or webview-free dialog to confirm the AMS mapping and send options, then send and start.

**Code:** `vsslicer/modules/bambu-extension/src/presentation/...` (module: `bambu-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Default mapping by type and colour is shown and can be changed; the options (timelapse, bed levelling, flow calibration, use AMS) are set; cancelling sends nothing
- [ ] Integration test with the fake Bambu adapter drives the dialog and checks the command

## Tasks

- [ ] Dialog
- [ ] Wire to registry upload
- [ ] Integration test

## Progress

Not started.
