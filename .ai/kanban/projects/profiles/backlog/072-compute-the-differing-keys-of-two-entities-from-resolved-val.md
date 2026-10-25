---
id: 72
title: Compute the differing keys of two entities from resolved values
type: feature
priority: P1
effort: S
model: sonnet
area: [form]
story: US32
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [49, 135]
created: 2026-10-25
---

The pure comparison used by the form: two entities (or an entity and its parent) to the list of keys whose resolved values differ.

**Code:** `vsslicer/modules/profiles/src/application/form-model/compare/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] Comparing two Orca process fixtures lists exactly the keys whose `ProfileStore.resolve` values differ (oracle)
- [ ] Entity versus parent lists only the entity's own overrides

## Tasks

- [ ] Write the diff
- [ ] Tests

## Progress

Not started.
