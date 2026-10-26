---
id: 264
title: "Import a STEP file into the model: repair on load and statistics"
type: feature
priority: P1
effort: M
model: sonnet
area: [step]
story: US67
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [263, 237, 53]
created: 2026-10-25
---

Reads the file, calls `importStep` with the chosen quality, runs `repairOnLoad` and the statistics on each solid and returns meshes with names and reports.

**Code:** `vsslicer/modules/project-extension/src/application/importStepFile.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] The assembly fixture gives meshes with repair reports
- [ ] An error from mesh-step surfaces as a typed result with the message
- [ ] Cancellation stops the work

## Tasks

- [ ] Use case
- [ ] Tests

## Progress

Not started.
