---
id: 216
title: Fill a bed with copies and multiply an instance
type: feature
priority: P2
effort: M
model: sonnet
area: [arrange]
story: US60
milestone: "VSS:M4"
sprint: "VSS:SP41"
depends_on: [211, 215]
created: 2026-10-25
---

`fillBed(item, bed, options)` places copies until none fits; `multiply(item, n, ...)` places exactly n or reports how many fit.

**Code:** `vsslicer/modules/arrange/src/application/fill.ts` (module: `arrange`, layer: `application`)

## Acceptance criteria

- [ ] Fill reaches the fixture count within one copy of Orca's recorded result
- [ ] Multiply places exactly n or returns the count that fit
- [ ] Copies get ids derived from the source

## Tasks

- [ ] Fill loop
- [ ] Multiply
- [ ] Tests

## Progress

Not started.
