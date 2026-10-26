---
id: 17
title: Write the printer registry service
type: feature
priority: P0
effort: M
model: sonnet
area: [api]
story: US4
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [15, 14]
created: 2026-10-25
---

The registry that holds registered adapters and the user's printers and opens sessions through the hub.

**Code:** `vsslicer/modules/printers-extension/src/application/...` (module: `printers-extension`, layer: `application`)

## Acceptance criteria

- [ ] Register and unregister adapters by id; list printers with their status events; open a session through `@vsslicer/printer-api`'s hub
- [ ] Registering a duplicate adapter id gives a typed error; a printer whose adapter is missing shows as unavailable, not removed
- [ ] Unit tests in plain Node with the fake adapter, no `vscode` import

## Tasks

- [ ] Write the registry
- [ ] Printer list and sessions
- [ ] Unit tests

## Progress

Not started.
