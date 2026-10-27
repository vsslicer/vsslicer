---
id: 29
title: "Compose the import pipeline: download, validate, map, merge with SpoolmanDB, report"
type: feature
priority: P1
effort: M
model: sonnet
area: [import]
story: US7
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [26, 27, 28]
created: 2026-10-25
---

One use case producing records and an import report, with progress and cancellation.

**Code:** `vsslicer/modules/filament/ofd/src/application/...` (module: `filament-ofd`, layer: `application`)

## Acceptance criteria

- [ ] On the fixtures the pipeline yields the expected records and a report listing skipped records and SpoolmanDB matches
- [ ] Cancellation stops before anything is returned; progress is reported per stage

## Tasks

- [ ] Write the pipeline
- [ ] Progress and cancel
- [ ] Tests

## Progress

Not started.
