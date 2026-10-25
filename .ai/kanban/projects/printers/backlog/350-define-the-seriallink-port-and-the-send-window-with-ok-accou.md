---
id: 350
title: Define the SerialLink port and the send window with ok accounting
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [346, 347]
created: 2026-10-25
---

The `SerialLink` port (open, write, line events, close) has two real sides: `serialport` and the emulator. The streamer sends framed lines while the number of outstanding lines stays within the window and counts each `ok`.

**Code:** `vsslicer/modules/printer-serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] With a scripted link the streamer never exceeds the window, sends lines in order with consecutive numbers, and ends when the last `ok` returns
- [ ] `M110 N0` is sent first; the window size and the maximum line length are settings with documented defaults
- [ ] Unit tests run in plain Node with no `serialport` import

## Tasks

- [ ] Port
- [ ] Window accounting
- [ ] Streamer loop
- [ ] Tests

## Progress

Not started.
