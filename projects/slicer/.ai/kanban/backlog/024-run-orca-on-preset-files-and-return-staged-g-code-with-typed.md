---
id: 24
title: Run Orca on preset files and return staged G-code with typed errors
type: feature
priority: P0
effort: L
model: opus
area: [orca, engine]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP12"
depends_on: [23, 20, 21, 14, 7]
created: 2026-10-25
---

The first adapter core: runs the CLI on already-written preset files (emission comes later), maps exit codes, signals and timeouts to typed errors, verifies that `plate_N.gcode` exists and is non-empty, and hands staged paths to the job.

**Code:** `vsslicer/modules/slicer-orca/src/adapters/...` (module: `slicer-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] Stub-binary tests: one per exit-code row, a signal crash, a timeout, exit 0 with an empty output directory and exit 0 with a missing `plate_N.gcode`, each ending in the right typed error
- [ ] Cancel through the runner leaves nothing in the staging area (stub that sleeps)
- [ ] The contract suite from `slicer-api` passes against the adapter with the stub binary
- [ ] Hand-written fixture presets slice the fixture cube with the installed Orca locally

## Tasks

- [ ] Compose runner and mapping
- [ ] Output verification
- [ ] Stub-binary matrix
- [ ] Contract suite run

## Progress

Not started.
