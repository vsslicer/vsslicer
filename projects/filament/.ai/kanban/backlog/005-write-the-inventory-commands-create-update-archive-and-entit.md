---
id: 5
title: "Write the inventory commands: create, update, archive and entity queries"
type: feature
priority: P1
effort: M
model: sonnet
area: [model]
story: US2
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [4]
created: 2026-10-25
---

Use cases over an `EventLogStore` port with an in-memory fake (the file store is the second side): entity changes are events in the log so the snapshot is rebuildable.

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] Create, update and archive of each entity are events; replaying the log from empty reproduces the snapshot byte for byte
- [ ] Archived spools are kept and excluded from active queries by default

## Tasks

- [ ] Define the store port and the fake
- [ ] Write the use cases
- [ ] Replay test

## Progress

Not started.
