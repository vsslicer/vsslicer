---
id: 63
title: "Add export, import, backup and restore commands"
type: feature
priority: P1
effort: S
model: sonnet
area: [ui]
story: US28
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [16, 62]
created: 2026-10-25
---

Commands for JSON export in Spoolman's `/export` shape, import of such a file, backup and restore, with file pickers.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Export then import into an empty store reproduces the inventory (integration test)
- [ ] Restore from a backup shows the confirmation and keeps the previous store as a backup

## Tasks

- [ ] Commands
- [ ] File pickers
- [ ] Integration test

## Progress

Not started.
