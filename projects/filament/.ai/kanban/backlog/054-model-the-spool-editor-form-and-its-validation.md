---
id: 54
title: Model the spool editor form and its validation
type: feature
priority: P1
effort: S
model: sonnet
area: [ui]
story: US24
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [16]
created: 2026-10-25
---

Pure form model: initial weight, empty spool weight, location, lot, price, extras, archive, with validation and draft state.

**Code:** `vsslicer/modules/filament-extension/src/application/...` (module: `filament-extension`, layer: `application`)

## Acceptance criteria

- [ ] Negative weight and an empty spool heavier than gross are rejected with messages
- [ ] A draft survives a model round trip

## Tasks

- [ ] Write the model
- [ ] Tests

## Progress

Not started.
