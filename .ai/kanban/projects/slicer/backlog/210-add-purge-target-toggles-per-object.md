---
id: 210
title: Add purge target toggles per object
type: feature
priority: P2
effort: S
model: sonnet
area: [multimaterial]
story: US53
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [208]
created: 2026-10-25
---

Panel section with the three purge toggles per object and the plate default.

**Code:** `vsslicer/modules/apps/slicer/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Toggles round trip to the project settings
- [ ] The section is disabled with a reason on an engine without the keys
- [ ] An override equal to the default is removed

## Tasks

- [ ] Section UI
- [ ] Host messages
- [ ] Tests

## Progress

Not started.
