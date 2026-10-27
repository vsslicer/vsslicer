---
id: 136
title: Refuse a printer whose firmware lacks the command
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US48
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [135]
created: 2026-10-25
---

`checkSupported(test, firmware)` returns either ok or a refusal that names the firmware, the parameter and the missing command.

**Code:** `vsslicer/modules/core/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] One test per generator and firmware returns ok or the expected refusal text
- [ ] An unknown firmware flavour refuses with a message, never emits a guess
- [ ] The refusal is data (code, firmware, parameter), so the presentation layer formats it

## Tasks

- [ ] Refusal type
- [ ] Check function
- [ ] Matrix test

## Progress

Not started.
