---
id: 143
title: Publish the Bambu print position
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US33
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [142, 47]
created: 2026-10-25
---

Fill `PrinterStatus.position` from `mc_print_line_number` or percent as the spike decided.

**Code:** `vsslicer/modules/printer/bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] The kit's follow checks pass on the fixture print stream: monotonic, reset on a new job, null when unknown

## Tasks

- [ ] Mapping
- [ ] Kit run

## Progress

Not started.
