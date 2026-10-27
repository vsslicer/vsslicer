---
id: 366
title: List serial ports as a Discoverer
type: feature
priority: P2
effort: S
model: sonnet
area: [serial]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [344]
created: 2026-10-25
---

Implements the `Discoverer` port with `serialport`'s port listing: path, vendor and product ids, serial number and a readable label for a small table of common boards. It never opens a port.

**Code:** `vsslicer/modules/printer/serial/src/adapters/...` (module: `printer-serial`, layer: `adapters`)

## Acceptance criteria

- [ ] With the mock binding the list shows the ports with labels; an unknown id shows the raw ids
- [ ] Opening is never attempted (test asserts no `open` call)
- [ ] Cancel stops the listing

## Tasks

- [ ] Lister
- [ ] Label table
- [ ] Tests

## Progress

Not started.
