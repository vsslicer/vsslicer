---
id: 10
title: Check arc-fitted fixtures against slicer output
type: chore
priority: P0
effort: S
model: sonnet
area: [parser]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [9, 2]
created: 2026-10-25
---

Proves the arc row against the real slicers.

## Acceptance criteria

- [ ] Arc-fitted PrusaSlicer and Orca fixtures tessellate within 0.05 mm chord tolerance (test)
- [ ] R form resolves to the same centre as I/J on those fixtures (test)

## Tasks

- [ ] Generate arc-fitted fixtures if missing
- [ ] Write the tolerance tests

## Progress

Not started.
