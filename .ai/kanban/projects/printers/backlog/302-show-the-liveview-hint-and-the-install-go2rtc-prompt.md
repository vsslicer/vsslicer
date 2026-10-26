---
id: 302
title: Show the Liveview hint and the install-go2rtc prompt
type: feature
priority: P1
effort: S
model: sonnet
area: [camera, bambu]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [295, 267, 271]
created: 2026-10-25
---

UI for the two guided states: 'Turn on LAN Mode Liveview' when the printer reports `disable`, and an explicit consent prompt before downloading go2rtc, with the explanation when it is declined.

**Code:** `vsslicer/modules/camera-extension/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Liveview-disabled state shows the hint with how to enable it; accepting go2rtc starts the download with progress; declining shows snapshots only if available, with the reason
- [ ] Consent is remembered per machine and revocable from a command

## Tasks

- [ ] Add the hint and prompt
- [ ] Add the setting and revoke command
- [ ] Write tests

## Progress

Not started.
