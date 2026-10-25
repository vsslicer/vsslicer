---
id: 39
title: Detect job ends from printer status and derive the job id
type: feature
priority: P1
effort: M
model: opus
area: [consumption]
story: US13
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [21, PRN-14, PRN-320]
created: 2026-10-25
---

Consume the `printer-api` status stream (`@vsslicer/printer-api` ^0.1.0) and emit one `JobEnd` (printer, job id, file, outcome, progress, per-tool observations placeholder) per job, ignoring redelivery. Depends on `printer-api` types only.

UNRESOLVED: needs printer-api (a job-end signal with a stable job id and outcome, or a documented derivation from `state` and `job`); PRN-4 has `job` and `materials[]` but no end event.

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] From recorded status sequences (printing to finished, cancelled, error, then a reconnect replay) one `JobEnd` per job with the right outcome and progress
- [ ] A redelivered sequence (reconnect, two windows) emits nothing new
- [ ] A job without a stable id gets a derived id (printer, file, start time) documented in code

## Tasks

- [ ] Write the tracker
- [ ] Derive ids
- [ ] Sequence tests

## Progress

Not started.
