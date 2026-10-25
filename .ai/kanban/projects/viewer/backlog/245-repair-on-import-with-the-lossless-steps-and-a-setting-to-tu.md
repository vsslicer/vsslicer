---
id: 245
title: Repair on import with the lossless steps and a setting to turn it off
type: feature
priority: P1
effort: S
model: sonnet
area: [repair]
story: US63
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [237, 53, 101]
created: 2026-10-25
---

After a mesh is parsed, runs `repairOnLoad` unless the setting is off, and attaches the report to the object.

**Code:** `vsslicer/modules/project-extension/src/application/loadRepair.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A broken STL fixture opens repaired with its report
- [ ] With the setting off the mesh is unchanged
- [ ] The report is part of the model, not of the history

## Tasks

- [ ] Use case
- [ ] Setting
- [ ] Tests

## Progress

Not started.
