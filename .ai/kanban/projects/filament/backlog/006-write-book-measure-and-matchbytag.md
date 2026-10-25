---
id: 6
title: "Write book, measure and matchByTag"
type: feature
priority: P1
effort: M
model: sonnet
area: [model]
story: US2
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [5]
created: 2026-10-25
---

The booking use cases the other modules call: `book(event)` (idempotent), `measure(spoolId, grossGrams)` and `matchByTag(uid)`.

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] `book` of a duplicate id changes nothing and returns the existing event
- [ ] `measure` records a `scale` correction so the used weight equals the reading; `matchByTag` finds a spool by normalised UID or returns none
- [ ] Property tests from the projection card still hold through these use cases

## Tasks

- [ ] Write the use cases
- [ ] Tests incl. replay

## Progress

Not started.
