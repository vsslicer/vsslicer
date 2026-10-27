---
id: 11
title: Migrate the store forward with a backup copy first
type: feature
priority: P1
effort: M
model: sonnet
area: [model]
story: US3
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [7]
created: 2026-10-25
---

A schema version field and forward migrations; a backup of the old files is written before any migration.

**Code:** `vsslicer/modules/filament/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] Migration from schema v1 to a test v2 keeps a backup and is reversible by restoring it
- [ ] A store with a newer schema than the code understands is refused with a typed error and left untouched

## Tasks

- [ ] Write the runner
- [ ] Write the backup
- [ ] Tests

## Progress

Not started.
