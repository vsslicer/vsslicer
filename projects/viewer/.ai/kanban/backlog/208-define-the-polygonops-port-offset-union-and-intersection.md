---
id: 208
title: "Define the PolygonOps port: offset, union and intersection"
type: feature
priority: P1
effort: S
model: sonnet
area: [arrange]
story: US61
milestone: "VSS:M4"
depends_on: [205, 204]
created: 2026-10-25
---

The port the placement uses for polygon offset by spacing and boolean operations, with a rectangle-only reference implementation for tests.

**Code:** `vsslicer/modules/arrange/src/application/ports.ts` (module: `arrange`, layer: `application`)

## Acceptance criteria

- [ ] The port is documented with the numeric contract (units, winding, tolerance)
- [ ] The reference implementation passes the same contract tests the real adapter will

## Tasks

- [ ] Port
- [ ] Contract tests
- [ ] Reference implementation

## Progress

Not started.
