---
id: 119
title: Implement backupCustomDocument and restore on open
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US37
milestone: "VSS:M4"
depends_on: [117, 118, 109]
created: 2026-10-25
---

Wires `backupCustomDocument` and the restore path in `openCustomDocument` (it receives the backup id).

**Code:** `vsslicer/modules/project-extension/src/presentation/editor/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Backup is called after edits and not after save
- [ ] Opening with a backup id restores the edits and marks the document dirty

## Tasks

- [ ] Handlers
- [ ] Test host test

## Progress

Not started.
