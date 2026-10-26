---
id: 96
title: "Show sync state, conflicts and the Moonraker wiring in the view"
type: feature
priority: P2
effort: M
model: sonnet
area: [spoolman, ui]
story: US38
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [95, 47, 52, PRN-339]
created: 2026-10-25
---

A status bar item for sync state, the conflict list in the inventory view, push logging in the output channel and the Moonraker proxy wiring from the printers extension.

UNRESOLVED: needs printers-extension: an export that gives `filament-extension` the Moonraker session's proxy request function.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The status item shows off, syncing, offline and error states in an integration test with a stopped and restarted fixture server
- [ ] The conflict list shows both values of a conflicting field; every push is in the output channel

## Tasks

- [ ] Status item
- [ ] Conflict list
- [ ] Logging
- [ ] Integration test

## Progress

Not started.
