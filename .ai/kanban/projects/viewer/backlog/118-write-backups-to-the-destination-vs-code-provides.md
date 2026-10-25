---
id: 118
title: Write backups to the destination VS Code provides
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US37
milestone: "VSS:M4"
sprint: "VSS:SP18"
depends_on: [117]
created: 2026-10-25
---

The Node file-system adapter of the `BackupStore` port: writes to the backup file path VS Code gives and reads it back.

**Code:** `vsslicer/modules/project-extension/src/adapters/backupStore.ts` (module: `project-extension`, layer: `adapters`)

## Acceptance criteria

- [ ] Writes are atomic (temp and rename)
- [ ] Reading a corrupt backup gives a typed error
- [ ] Backup of a 100 MB project is the log plus the reference, not the project

## Tasks

- [ ] Adapter
- [ ] Corrupt-file test

## Progress

Not started.
