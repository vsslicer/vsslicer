---
id: 61
title: Back up and restore the store files
type: feature
priority: P1
effort: S
model: sonnet
area: [model]
story: US28
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [21]
created: 2026-10-25
---

Copy snapshot, log and catalogue to a chosen folder; restore replaces the store and keeps the previous one as a backup.

**Code:** `vsslicer/modules/filament/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] Backup then restore into an empty directory reproduces the store byte for byte
- [ ] Restore keeps the previous files as a backup copy and refuses a backup of a newer schema

## Tasks

- [ ] Write backup
- [ ] Write restore
- [ ] Tests

## Progress

Not started.
