---
id: 428
title: Assemble the Anycubic adapter with a firmware gate
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [427]
created: 2026-10-25
---

Composes status and job control into the `anycubic-lan` adapter; upload is offered only if the spike found a procedure. The firmware table decides read-only mode.

**Code:** `vsslicer/modules/printer-unofficial-anycubic/src/application/...` (module: `printer-unofficial-anycubic`, layer: `application`)

## Acceptance criteria

- [ ] Status and job control pass on the fixtures; upload is absent from the capabilities unless the spike decision says otherwise
- [ ] An unknown firmware opens read-only; the descriptor carries the `reverse engineered` label and the LAN-mode warning text

## Tasks

- [ ] Descriptor
- [ ] Job control
- [ ] Firmware gate
- [ ] Tests

## Progress

Not started.
