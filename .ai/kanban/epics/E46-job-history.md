---
id: E46
title: Keep a job history linked to projects and plates
status: reviewed
initiative: I9
project: PRN
order: 9
depends_on: [E22, E25, E8]
rows: ["§15 Job history"]
---

Delivers job history in `vsslicer.fleet`: every print VSSlicer sends is recorded with its project,
plate, printer, profile and outcome in `.vsslicer/history/YYYY-MM.jsonl`, linking slicer and printer
records that no printer-side store links (`projects-and-fleet.md` §3, §5). A History view shows it per
project and per printer, and Moonraker printers can back-fill their own history. It is for users who
want to know what printed where, how long it took and how much filament it used.

## Scope

In:
- `vsslicer.fleet` extension (`extensionKind: ["ui"]`, created here; E47 adds the queue).
- Record: Moonraker's job shape (`job_id, filename, status, start_time, end_time, print_duration,
  total_duration, filament_used, metadata`) plus `vsslicer_job_id`, `project`, `plate_index`,
  `printer_id`, `profile_ref`, `thumbnail` (path), `timelapse` (optional, from E39).
- Writer in the agent (one writer for all windows): append on upload done, job start and job end
  from the session status stream; per project when the file came from a workspace project, else a
  global history in `globalStorageUri`.
- VSSlicer job id written into the sent file: a G-code header comment for plain G-code, a metadata
  entry in `.gcode.3mf` through `@vsslicer/3mf` (E8), so printer-side records can be matched.
- Moonraker back-fill from `server/history/list` (optional command), de-duplicated by printer plus
  `start_time`.
- History view (tree): by month, project, printer; open the plate, the G-code, re-send.

Out: the fleet queue (E47), Bambu cloud history importer (I9 excludes it; it needs a cloud
login), OctoPrint history (core has none; the PrintJobHistory plugin is abandoned), totals dashboard.

## Feature-matrix rows

- §15 Job history (P1): done when a send to the H2C and to a fixture Moonraker printer each produce
  a history record with project and plate links and a final status, visible in the History view.

## Acceptance criteria

- [ ] JSONL schema with a version field and a JSON Schema; tests for append, monthly rollover,
      corrupt line tolerated (skipped with a warning, never truncating the file)
- [ ] De-duplication test: back-filled Moonraker records that match a sent job by printer plus
      `start_time` merge, not duplicate
- [ ] Two-window test: both windows' sends land in one file through the agent with no interleaved
      partial lines
- [ ] Job id embedding: a `.gcode.3mf` round trips through `@vsslicer/3mf` with the id and still
      prints on the H2C (firmware recorded); a plain G-code header comment is ignored by Moonraker
      metadata parsing fixtures
- [ ] Status mapping tests: Moonraker statuses (`completed`, `cancelled`, `error`,
      `klippy_shutdown`, ...) and Bambu end states to the record's `status`
- [ ] History view integration test with fixture files
- H2C for one end-to-end record; Moonraker on fixtures (D5).

## Dependencies

- Needs E22 (agent writer), E25 (upload and job events), E21 and E23 (status streams),
  E8 (`.gcode.3mf` metadata write), E10 (`ProjectModel` plate references, optional link).
- Exposes `History` (query, append events) to E47 (queue items become history records), E42
  (consumption per job may reference `vsslicer_job_id`).

## Risks and spikes

- Modifying the file at send changes its checksum: Moonraker upload checksums are computed after
  the edit; Bambu accepts an extra metadata entry (verified on the H2C before the format is fixed).
- History in the project folder ends up in git: documented; `.vsslicer/history/` is suggested for
  `.gitignore` but not forced.

## Eng review

- Scope challenge: history alone is two sprints and P1, so it ships before the P2 queue; merging it
  with E47 would delay a P1 row behind P2 work.
- Data loss: append-only with `fsync`, never rewrite in place; corrupt lines are skipped, not
  dropped from disk.
- Reversibility: job id embedding has a setting (off leaves sent files untouched, history still
  records from the sender side).
