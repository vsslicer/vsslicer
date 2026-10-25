---
id: 262
title: Import a 50 MB STEP file in a worker without blocking the host
type: feature
priority: P1
effort: M
model: opus
area: [step, mesh]
story: US69
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [258, 253]
created: 2026-10-25
---

Generates or collects a 50 MB STEP file, imports it in the worker and measures event loop delay and peak memory of the worker.

**Code:** `vsslicer/modules/mesh-step/test/large/` (module: `mesh-step`, layer: n/a (tests))

## Acceptance criteria

- [ ] Event loop delay of the host stays under 50 ms during the import
- [ ] Progress and cancel work on the large file
- [ ] Peak memory is recorded and a cap is set from it

## Tasks

- [ ] Large file source
- [ ] Measurement
- [ ] Cap

## Progress

Not started.
