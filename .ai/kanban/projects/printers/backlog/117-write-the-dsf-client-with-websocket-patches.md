---
id: 117
title: Write the DSF client with WebSocket patches
type: feature
priority: P0
effort: M
model: sonnet
area: [duet]
story: US22
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [114, 113]
created: 2026-10-25
---

DSF `/machine/*` REST plus the WebSocket model patches and upload.

**Code:** `vsslicer/modules/printer-duet/src/adapters/...` (module: `printer-duet`, layer: `adapters`)

## Acceptance criteria

- [ ] Patches merge into the status; reconnect resubscribes; upload via `/machine/file` with progress and abort

## Tasks

- [ ] REST client
- [ ] Patch merge
- [ ] Upload and tests

## Progress

Not started.
