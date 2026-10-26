---
id: 212
title: Arrange a selection and report items that do not fit
type: feature
priority: P1
effort: S
model: sonnet
area: [arrange]
story: US58
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [211]
created: 2026-10-25
---

The `arrange(items, bed, options)` use case: unselected items act as obstacles; unplaced items are returned by name with their poses unchanged.

**Code:** `vsslicer/modules/arrange/src/application/arrange.ts` (module: `arrange`, layer: `application`)

## Acceptance criteria

- [ ] Selection-only arrange never moves unselected items
- [ ] An item larger than the bed is unplaced and named
- [ ] No returned pose is outside the region

## Tasks

- [ ] Use case
- [ ] Tests

## Progress

Not started.
