---
id: 106
title: Map PrusaLink status to PrinterStatus
type: feature
priority: P0
effort: S
model: sonnet
area: [prusalink]
story: US21
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [104, 14]
created: 2026-10-25
---

The nine PrusaLink states, progress and temperatures.

**Code:** `vsslicer/modules/printer/prusalink/src/domain/...` (module: `printer-prusalink`, layer: `domain`)

## Acceptance criteria

- [ ] A case per state from the fixtures; unknown state is `error` with the vendor string

## Tasks

- [ ] Mapper
- [ ] Tests

## Progress

Not started.
