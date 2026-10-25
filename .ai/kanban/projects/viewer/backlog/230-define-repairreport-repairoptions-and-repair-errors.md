---
id: 230
title: "Define RepairReport, RepairOptions and repair errors"
type: feature
priority: P1
effort: S
model: sonnet
area: [mesh, repair]
story: US65
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [38]
created: 2026-10-25
---

Types for the report (vertices merged, faces removed, holes filled, normals flipped, unrepairable regions), the options (tolerance, steps, cancel token) and typed errors with messages.

**Code:** `vsslicer/modules/mesh/src/domain/repair/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Tolerance defaults to a conservative value and is part of the report
- [ ] An unrepairable result is a distinct outcome from an error
- [ ] No I/O in the folder

## Tasks

- [ ] Types
- [ ] Messages
- [ ] Tests

## Progress

Not started.
