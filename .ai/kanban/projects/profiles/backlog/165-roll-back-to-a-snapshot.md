---
id: 165
title: Roll back to a snapshot
type: feature
priority: P2
effort: S
model: sonnet
area: [store]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [164]
created: 2026-10-25
---

Use case that restores a snapshot and re-indexes the store.

**Code:** `vsslicer/modules/profiles/src/application/...` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] After apply then rollback, a hash of the vendor folder and user files equals the hash before apply (byte for byte)
- [ ] Rollback of a missing snapshot gives a typed error

## Tasks

- [ ] Use case
- [ ] Tests

## Progress

Not started.
