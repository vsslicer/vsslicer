---
id: 332
title: Expose ipcam state and rtsp_url on the Bambu session
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US43
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [148]
created: 2026-10-25
---

Reads the MQTT `ipcam` block (`rtsp_url`, liveview state, resolution, timelapse flag) into `session.ipcam()` and a change event, for `camera-bambu`.

**Code:** `vsslicer/modules/printer/bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] From the recorded H2C session `rtsp_url` is returned, `disable` is reported as `disabled`, and a missing block as `unknown`
- [ ] The access code is never in log lines or error text (redaction test)

## Tasks

- [ ] Parse ipcam
- [ ] Accessor and event
- [ ] Redaction test

## Progress

Not started.
