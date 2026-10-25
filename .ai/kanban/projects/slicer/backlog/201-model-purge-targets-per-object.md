---
id: 201
title: Model purge targets per object
type: feature
priority: P2
effort: S
model: sonnet
area: [multimaterial]
story: US53
milestone: "VSS:M5"
sprint: "VSS:SP27"
depends_on: [195]
created: 2026-10-25
---

Per-object flags for `flush_into_infill`, `flush_into_objects` and `flush_into_support`, with inheritance from the plate default.

**Code:** `vsslicer/modules/multimaterial/src/domain/...` (module: `multimaterial`, layer: `domain`)

## Acceptance criteria

- [ ] An object without its own value inherits the plate value; setting it equal to the plate value removes the override
- [ ] Keys round trip to and from the setting map
- [ ] All three off is allowed and means purge goes to the tower

## Tasks

- [ ] Model
- [ ] Inheritance
- [ ] Tests

## Progress

Not started.
