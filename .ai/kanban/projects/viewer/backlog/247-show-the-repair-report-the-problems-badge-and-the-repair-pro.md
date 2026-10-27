---
id: 247
title: "Show the repair report, the problems badge and the repair prompt"
type: feature
priority: P1
effort: M
model: sonnet
area: [repair]
story: US66
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [246, 67, 152]
created: 2026-10-25
---

Shows the report per object in the tree and a detail panel, the badge from the mesh statistics, and a Repair action on problem objects.

**Code:** `vsslicer/modules/apps/project/src/presentation/repair/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] An object with open edges shows the badge and Repair; after repair the badge is gone
- [ ] The report lists merged, removed, filled and flipped counts and the tolerance
- [ ] An unrepairable object says so and keeps the badge

## Tasks

- [ ] Badge
- [ ] Report panel
- [ ] Action

## Progress

Not started.
