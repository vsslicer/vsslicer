---
id: 330
title: "Attach the job id, AMS mapping and end outcome to the Bambu job"
type: feature
priority: P1
effort: M
model: sonnet
area: [bambu]
story: "FIL:US15"
milestone: "VSS:M4"
depends_on: [320, 148, 48]
created: 2026-10-25
---

Fills printer-api `job.id` (`task_id`), `job.materialMapping` (the `ams_mapping` recorded when VSSlicer sent the job, PRN-36/48) and the end outcome of a Bambu job. A job started elsewhere has no mapping.

**Code:** `vsslicer/modules/printer-bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] Recorded sessions: FINISH and FAILED give one `JobEnd` with the task id; the mapping sent by VSSlicer is returned for that job and survives an adapter reconnect
- [ ] A job started on the printer or the app has an id and `materialMapping` undefined
- [ ] Verified on recordings; the H2C run is a separate card

## Tasks

- [ ] Record mapping at send
- [ ] Attach to job
- [ ] Map end outcome
- [ ] Fixture tests

## Progress

Not started.
