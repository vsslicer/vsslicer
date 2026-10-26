---
id: 200
title: "Model wipe tower settings: type, position, size and ramming"
type: feature
priority: P2
effort: S
model: sonnet
area: [multimaterial]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [195]
created: 2026-10-25
---

Pure model and validation of `wipe_tower_type` (Type 1, Type 2), position, size and the ramming settings, mapped to and from the setting keys.

**Code:** `vsslicer/modules/multimaterial/src/domain/...` (module: `multimaterial`, layer: `domain`)

## Acceptance criteria

- [ ] A tower outside the bed is refused with the overflow named
- [ ] Type 2 hides the ramming fields; a test lists which keys each type uses
- [ ] Round trip: keys to model and back keeps every value

## Tasks

- [ ] Model
- [ ] Validation
- [ ] Key mapping
- [ ] Tests

## Progress

Not started.
