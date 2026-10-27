---
id: 87
title: "Implement writeProject(project, pkg, {dialect})"
type: feature
priority: P1
effort: M
model: sonnet
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [85, 86]
created: 2026-10-25
---

The use case behind saving: builds the plan from the change tracking, calls the part writers and returns the new package plus the `SaveNotice`. A foreign-dialect source is refused unless a conversion is requested.

**Code:** `vsslicer/modules/core/3mf/src/application/writeProject.ts` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [ ] Bambu and Orca fixtures edited by a scripted operation set save and read back equal
- [ ] A Prusa or Cura source without a conversion request returns a typed error
- [ ] The result carries the save notice
- [ ] Public types are added to the API report

## Tasks

- [ ] Use case
- [ ] Dialect guard
- [ ] Tests

## Progress

Not started.
