---
id: 188
title: Show the refusal reason before any slicing
type: feature
priority: P2
effort: S
model: sonnet
area: [tasks, calibration]
story: US48
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [187, 147]
created: 2026-10-25
---

Formats the refusal from `checkSupported` as a notification naming firmware, parameter and missing command.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Input shaping on a Bambu printer shows the refusal and starts no slice (test)
- [ ] The message text is built from the refusal data, one string table
- [ ] The notification offers "Choose another test"

## Tasks

- [ ] Format refusal
- [ ] Wire into command
- [ ] Tests

## Progress

Not started.
