---
id: 44
title: "Implement ProfileStore get, list, query and the index"
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US20
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [38, 135, 136]
created: 2026-10-25
---

The in-memory index over entities by id, kind, vendor and compatibility, with a `ProfileFiles` port (file system and in-memory) and identity from `id`, never from file names.

**Code:** `vsslicer/modules/profiles/src/application/store/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] `get`, `list` and `query` return the expected entities from the in-memory port, including a vendor tree of 14 420 entities
- [ ] Two files with the same `id` give a diagnostic and the one in the user layer wins
- [ ] Renaming a file does not change an entity's identity (test)

## Tasks

- [ ] Define the port and the index
- [ ] Implement get/list/query
- [ ] Tests

## Progress

Not started.
