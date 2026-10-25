---
id: 147
title: Add `intent` to the process entity and override blocks and widen the enum
type: feature
priority: P2
effort: M
model: opus
area: [schema]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [3, 136]
created: 2026-10-25
---

Cura's intent layer sits between quality and the user's changes. Decide the representation (an optional `intent` on `overrides[]` blocks of a `process`, matched when that intent is requested, so no new entity kind) and extend the types and JSON Schema. Existing `intent` values from `profiles.md` §6 stay valid.

**Code:** `vsslicer/modules/profile-api/src/domain/...` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] `intent` accepts the existing four values plus Cura's eight categories (engineering, visual, quick, solid, annealing, strong, highspeed, highspeedsolid); positive and negative schema fixtures cover each, and an unknown value is rejected
- [ ] An override block with an `intent` applies only when that intent is requested; `merge` and the evaluator behave exactly as before when none is (existing tests pass unchanged)
- [ ] The decision and a worked Cura example are in the module docs
- [ ] Type-level tests fail if the field is dropped

## Tasks

- [ ] Decide and document the representation
- [ ] Types and schema
- [ ] Fixtures
- [ ] Tests

## Progress

Not started.
