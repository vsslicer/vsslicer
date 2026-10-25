---
id: 96
title: Stage wizard output so cancelling leaves nothing behind
type: feature
priority: P0
effort: S
model: sonnet
area: [wizard]
story: US41
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [95, 135]
created: 2026-10-25
---

Entities and secrets are held in a draft and written only at finish.

**Code:** `vsslicer/modules/profiles/src/application/wizard/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] Cancelling at each of the steps leaves no entity in the store and no secret in the vault (test per step)
- [ ] A failure while writing at finish rolls back everything written so far

## Tasks

- [ ] Draft holder
- [ ] Rollback
- [ ] Tests

## Progress

Not started.
