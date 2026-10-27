---
id: 357
title: "Open a session: reset banner, M110, M115 probe and capabilities"
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [351, 352, 348]
created: 2026-10-25
---

`open(connection)` waits for the firmware banner after a DTR reset, sends `M110 N0` and `M115`, and fills the session's capabilities from what the firmware reports, including `longFilenames`; `probe(endpoint)` is the same without starting a session.

**Code:** `vsslicer/modules/printer/serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] Against the emulator configured as Marlin 2.1 with LFN, the session reports `longFilenames`, `telemetryPoll` and, with an SD card, the SD capabilities; configured as 1.1.x without LFN it reports `longFilenames` false
- [ ] A port that answers nothing within the timeout gives `unreachable`; one that answers with non-Marlin text gives `unsupported`
- [ ] An explicit connection setting overrides the detected `longFilenames`

## Tasks

- [ ] Banner wait
- [ ] Probe
- [ ] Capability mapping
- [ ] Tests

## Progress

Not started.
