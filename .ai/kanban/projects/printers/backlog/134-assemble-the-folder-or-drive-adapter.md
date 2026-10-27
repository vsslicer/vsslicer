---
id: 134
title: Assemble the folder-or-drive adapter
type: feature
priority: P0
effort: S
model: sonnet
area: [storage]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [131, 132, 14]
created: 2026-10-25
---

A `PrinterAdapter` with only `upload`: sanitise the name, safe-write, report progress.

**Code:** `vsslicer/modules/printer/folder/src/application/...` (module: `printer-folder`, layer: `application`)

## Acceptance criteria

- [ ] Contract kit upload checks that apply pass (thin adapter); the final name is returned to the caller
- [ ] Name collisions in the target are resolved, never overwritten silently

## Tasks

- [ ] Adapter
- [ ] Kit run

## Progress

Not started.
