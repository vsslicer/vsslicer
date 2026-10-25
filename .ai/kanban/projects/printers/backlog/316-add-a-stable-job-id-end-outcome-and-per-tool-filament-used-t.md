---
id: 316
title: "Add a stable job id, end outcome and per-tool filament used to the job type"
type: feature
priority: P1
effort: S
model: sonnet
area: [api]
story: "FIL:US13"
milestone: "VSS:M4"
sprint: "VSS:SP24"
created: 2026-10-25
---

Gives consumers (FIL-39, FIL-43) a job-end signal without scraping vendor states. `PRN-186` (`job-history@0.1.0`) only maps end states to a record status and the end detection lives in the agent (PRN-210), so the filament module cannot take it from there.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] `PrinterStatus.job` gets an optional adapter-supplied `id` (Moonraker `job_id`, Bambu `task_id`) and a documented derivation (printer id, file, start time) for adapters without one
- [ ] A `JobEnd` value type: job id, printer id, file, outcome `completed|cancelled|failed|interrupted`, progress, and `filamentUsed[]` per tool (millimetres, optional grams) with tool index
- [ ] Pure helper `deriveJobId(printerId, file, startedAt)` stable across redelivery (property test); type tests show existing `0.3.0` consumers still compile (api-extractor diff additive)

## Tasks

- [ ] Write the types
- [ ] Write deriveJobId
- [ ] Type and property tests

## Progress

Not started.
