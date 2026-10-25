---
id: 163
title: Snapshot and restore the vendor tree and user files
type: feature
priority: P2
effort: M
model: sonnet
area: [store]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [159, 45]
created: 2026-10-25
---

A snapshot store that copies the vendor folder and the user entity files to a snapshot directory with a manifest of hashes, and restores them.

**Code:** `vsslicer/modules/profiles/src/adapters/...` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [ ] Restore returns every file byte for byte (hash comparison over the fixture trees), including files the update deleted and removing files it added
- [ ] A snapshot with a missing or altered file fails verification before restore
- [ ] Snapshots are listed, and old ones can be pruned by count

## Tasks

- [ ] Copy and manifest
- [ ] Restore
- [ ] Verify
- [ ] Tests

## Progress

Not started.
