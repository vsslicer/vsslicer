---
id: 90
title: "Add Moonraker API key, oneshot token and trusted-client auth"
type: feature
priority: P0
effort: S
model: sonnet
area: [moonraker]
story: US19
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [89]
created: 2026-10-25
---

The three auth modes.

**Code:** `vsslicer/modules/printer/moonraker/src/adapters/...` (module: `printer-moonraker`, layer: `adapters`)

## Acceptance criteria

- [ ] API key header; `access/oneshot_token` fetched for the WebSocket; trusted-client with no credential; a 401 gives `PrinterError.auth` (fixtures)

## Tasks

- [ ] Auth modes
- [ ] Fixture tests

## Progress

Not started.
