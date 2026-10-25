---
id: 114
title: Map the Duet object model to PrinterStatus
type: feature
priority: P0
effort: M
model: sonnet
area: [duet]
story: US22
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [112, 14]
created: 2026-10-25
---

RRF `rr_model` and DSF object model status, heaters, job and progress.

**Code:** `vsslicer/modules/printer-duet/src/domain/...` (module: `printer-duet`, layer: `domain`)

## Acceptance criteria

- [ ] Fixture snapshots from both map to the same shape; Duet statuses map through the printer-api table

## Tasks

- [ ] Mapper
- [ ] Tests

## Progress

Not started.
