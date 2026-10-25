---
id: 389
title: "Assemble the SDCP adapter: start, pause, continue, stop"
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [386, 387, 388]
created: 2026-10-25
---

Composes the pieces into the `sdcp` `PrinterAdapter`: capabilities from what exists, start (command 128 with `Filename` and `StartLayer`) after upload, pause 129, continue 131, stop 130, file list 258 and delete 259.

**Code:** `vsslicer/modules/printer-unofficial-sdcp/src/application/...` (module: `printer-unofficial-sdcp`, layer: `application`)

## Acceptance criteria

- [ ] Upload then start follows the order Orca uses (stream the file, then the WebSocket command) and the job reaches `printing` on the fixtures
- [ ] Pause, continue and stop are gated by the reported state (test)
- [ ] Video stream and history commands are not exposed

## Tasks

- [ ] Descriptor
- [ ] Job control
- [ ] File list and delete
- [ ] Tests

## Progress

Not started.
