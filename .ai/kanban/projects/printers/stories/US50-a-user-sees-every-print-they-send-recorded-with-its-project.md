---
id: US50
title: "A user sees every print they send recorded with its project, plate, printer, profile and outcome"
status: reviewed
epic: VSS:E46
---

As a user who prints from several projects on several printers, I want every send, job start and job end to be recorded with the project, plate, printer, profile and final status, so that I know what printed where, how long it took and how much filament it used, which no printer-side store links to my projects.

## Acceptance criteria

- [ ] JSONL history in `.vsslicer/history/YYYY-MM.jsonl` of the project (or a global file in `globalStorageUri` when the file did not come from a workspace project), with a version field and a checked-in JSON Schema
- [ ] The record has Moonraker's job shape plus `vsslicer_job_id`, `project`, `plate_index`, `printer_id`, `profile_ref`, `thumbnail` and an optional `timelapse`; events append on upload done, job start and job end taken from the session status stream
- [ ] Moonraker statuses (`completed`, `cancelled`, `error`, `klippy_shutdown`, ...) and Bambu end states map to the record's `status` (table test)
- [ ] Append, monthly rollover and query by month, project and printer are tested; `History` (query, append events) is exported for the queue and for filament consumption
- [ ] A send to the H2C and to a fixture Moonraker printer each produce a record with project and plate links and a final status

## Out of scope

- The History view (US53), back-fill (US52) and the job id in the file (US51).
- Populating `timelapse` (arrives with the camera epics).
