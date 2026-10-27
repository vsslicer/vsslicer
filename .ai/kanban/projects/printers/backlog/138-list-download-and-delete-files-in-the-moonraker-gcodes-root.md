---
id: 138
title: "List, download and delete files in the Moonraker gcodes root"
type: feature
priority: P1
effort: S
model: sonnet
area: [moonraker, storage]
story: US28
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [92]
created: 2026-10-25
---

`server/files/*` for the `gcodes` root: list, metadata with thumbnails, download, delete, move.

**Code:** `vsslicer/modules/printer/moonraker/src/adapters/...` (module: `printer-moonraker`, layer: `adapters`)

## Acceptance criteria

- [ ] Recorded sessions pass for each operation; a 403 root gives `refused`; capability flags set

## Tasks

- [ ] Operations
- [ ] Tests

## Progress

Not started.
