---
id: 425
title: Define Anycubic messages and normalise status
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [424]
created: 2026-10-25
---

Pure types for the status and control payloads and the mapping to `PrinterStatus`, written from the spike document.

**Code:** `vsslicer/modules/printer-unofficial-anycubic/src/domain/...` (module: `printer-unofficial-anycubic`, layer: `domain`)

## Acceptance criteria

- [ ] Fixture payloads decode to typed values; unknown fields are carried
- [ ] The state map covers idle, printing, paused, finished and error

## Tasks

- [ ] Types
- [ ] State map
- [ ] Tests

## Progress

Not started.
