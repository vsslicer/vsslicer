---
id: 47
title: "Implement save, update and diff-only user entities"
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US21
milestone: "VSS:M2"
sprint: "VSS:SP13"
depends_on: [44, 135]
created: 2026-10-25
---

`save`/`update` write a user entity as its diff against the parent plus the parent `id` and `version` (`profiles.md` §6), and `update` is the write-back SLC calibration will call.

**Code:** `vsslicer/modules/profiles/profiles/src/application/store/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] Saving an edited vendor-derived process stores only the changed keys, the parent id and the parent version
- [ ] `update(id, patch)` changes the named keys and nothing else; the saved file diff is those keys
- [ ] Saving an entity with a failing schema validation returns a typed error and writes nothing

## Tasks

- [ ] Write the diff computation
- [ ] Write save/update
- [ ] Tests

## Progress

Not started.
