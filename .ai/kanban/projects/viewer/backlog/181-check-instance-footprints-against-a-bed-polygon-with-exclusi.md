---
id: 181
title: Check instance footprints against a bed polygon with exclusion areas
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [171]
created: 2026-10-25
---

Pure test that a footprint polygon lies inside a rectangular, circular or polygon bed and outside exclusion areas.

**Code:** `vsslicer/modules/project-extension/src/domain/plates/bed.ts` (module: `project-extension`, layer: `domain`)

## Acceptance criteria

- [ ] Inside, touching and outside cases for each bed shape
- [ ] An exclusion area overlap is reported with its index

## Tasks

- [ ] Polygon tests
- [ ] Tests

## Progress

Not started.
