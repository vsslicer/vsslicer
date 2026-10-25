---
id: 361
title: Publish the streamed byte position for follow
type: feature
priority: P2
effort: S
model: sonnet
area: [serial]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [359, 320]
created: 2026-10-25
---

Streaming knows exactly which file offset the printer has accepted, so it publishes that position on the same channel as the other connectors, for the preview's follow mode.

**Code:** `vsslicer/modules/printer-serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] While streaming, the published offset is the byte offset of the last acknowledged line (test with the emulator)
- [ ] The offset is monotonic across a resend
- [ ] The `followPosition` check of the contract kit passes

## Tasks

- [ ] Position from the ack counter
- [ ] Contract kit check

## Progress

Not started.
