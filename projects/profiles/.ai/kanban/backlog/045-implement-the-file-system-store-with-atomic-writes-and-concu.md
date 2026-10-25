---
id: 45
title: Implement the file-system store with atomic writes and concurrent-edit protection
type: feature
priority: P0
effort: M
model: opus
area: [store]
story: US20
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [44, 135]
created: 2026-10-25
---

Reads and writes one JSON file per user entity under `.vsslicer/profiles/` and vendor entities under a given global folder; writes go through a temp file and rename, and compare `meta.updated`.

**Code:** `vsslicer/modules/profiles/src/adapters/fs-store/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [ ] Two simulated windows writing the same workspace never lose an edit: the second writer gets a conflict error carrying both versions (test with two store instances)
- [ ] An unchanged entity is never rewritten (mtime test)
- [ ] A crash between temp write and rename leaves the old file intact (fault injection test)

## Tasks

- [ ] Write the adapter
- [ ] Atomic write and conflict check
- [ ] Fault-injection tests

## Progress

Not started.
