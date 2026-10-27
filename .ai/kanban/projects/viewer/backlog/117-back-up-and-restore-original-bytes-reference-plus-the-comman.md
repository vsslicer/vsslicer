---
id: 117
title: "Back up and restore: original-bytes reference plus the command log"
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US37
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [116, 108]
created: 2026-10-25
---

`backup` writes a reference to the original file (path, size, hash) plus the log through a `BackupStore` port; `restore` replays it. An incompatible log falls back to the last saved file with a message.

**Code:** `vsslicer/modules/apps/project/src/application/backup.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Restore after backup gives an equal model (round trip over random sequences)
- [ ] A missing or changed original is reported, not replayed
- [ ] Incompatible version falls back to the saved file with the message text
- [ ] The port has a Node file-system side and an in-memory side

## Tasks

- [ ] Use cases
- [ ] BackupStore port
- [ ] Fallback
- [ ] Tests

## Progress

Not started.
