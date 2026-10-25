---
id: 89
title: "Detect conflicts, resolve last-writer-wins and keep deletes archival"
type: feature
priority: P2
effort: M
model: opus
area: [spoolman]
story: US35
milestone: "VSS:M4"
depends_on: [88]
created: 2026-10-25
---

Per-field last writer wins; conflicts are recorded with both values; a delete in Spoolman archives the local spool, never deletes it.

**Code:** `vsslicer/modules/filament-spoolman/src/application/...` (module: `filament-spoolman`, layer: `application`)

## Acceptance criteria

- [ ] The same field edited on both sides between syncs appears in the conflict list with both values
- [ ] A Spoolman delete archives the local spool and keeps its events

## Tasks

- [ ] Write the detection
- [ ] Write the resolution
- [ ] Tests

## Progress

Not started.
