---
id: 53
title: Add the Sync AMS to project command
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US12
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [50, 48]
created: 2026-10-25
---

A command that returns the loaded AMS filaments to its caller.

**Code:** `vsslicer/modules/bambu-extension/src/presentation/...` (module: `bambu-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `vsslicer.bambu.syncAms` returns the loaded filaments for a chosen printer, and shows them in a message when run by hand
- [ ] Disabled when no AMS is reported

## Tasks

- [ ] Command
- [ ] Return value
- [ ] Test

## Progress

Not started.
