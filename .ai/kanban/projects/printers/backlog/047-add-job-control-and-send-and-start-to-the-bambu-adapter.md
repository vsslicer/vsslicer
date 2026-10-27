---
id: 47
title: Add job control and send-and-start to the Bambu adapter
type: feature
priority: P1
effort: M
model: opus
area: [bambu]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [45, 41, 43, 44, 37]
created: 2026-10-25
---

Compose pause/resume/stop, FTPS upload and `project_file` into `uploadAndStart`, and expose the AMS sync.

**Code:** `vsslicer/modules/printer/bambu/src/application/...` (module: `printer-bambu`, layer: `application`)

## Acceptance criteria

- [ ] The contract kit job and upload checks pass; `uploadAndStart` uploads then starts and reports one progress stream
- [ ] A failed start after a successful upload leaves the file and reports the failure
- [ ] Capability set shrinks correctly in read-only mode

## Tasks

- [ ] Compose upload and start
- [ ] Expose AMS sync
- [ ] Kit run

## Progress

Not started.
