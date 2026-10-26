---
id: 229
title: Verify a send to the H2C produces a linked history record
type: chore
priority: P1
effort: M
model: opus
area: [history, bambu]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [224, 228, 181, 60]
created: 2026-10-25
---

End to end on the H2C: send a plate from a project, watch the job, check the record, the job id in the file and the History view.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] On the H2C: record with project, plate and final status, firmware recorded
- [ ] On the Moonraker fixture: the same, plus a back-fill that merges

## Tasks

- [ ] Run on the H2C
- [ ] Run on fixtures
- [ ] Record the result

## Progress

Not started.
