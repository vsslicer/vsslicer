---
id: 122
title: Discover printers over SSDP
type: feature
priority: P1
effort: M
model: sonnet
area: [discovery]
story: US23
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [120, 14]
created: 2026-10-25
---

A `Discoverer` for SSDP on 239.255.255.250:1900.

**Code:** `vsslicer/modules/printer-discovery/src/adapters/...` (module: `printer-discovery`, layer: `adapters`)

## Acceptance criteria

- [ ] Test with an in-process SSDP responder; malformed responses are ignored with a debug log; stops on dispose

## Tasks

- [ ] Discoverer
- [ ] Responder test

## Progress

Not started.
