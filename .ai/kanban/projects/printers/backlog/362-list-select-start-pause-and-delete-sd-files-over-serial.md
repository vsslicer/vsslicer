---
id: 362
title: "List, select, start, pause and delete SD files over serial"
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [357, 354]
created: 2026-10-25
---

File operations on the printer's card through `M20`, `M20 L`, `M23`, `M24`, `M25`, `M27` and `M30`, offered only when `M115` and `M21` report a card.

**Code:** `vsslicer/modules/printer/serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] Against the SD model: list returns names, sizes and long names when available; select-and-start prints the file and `M27` progress shows in status
- [ ] Delete removes the file and the list reflects it; deleting while printing is refused with `busy`
- [ ] No SD capability is exposed when the emulator reports no card

## Tasks

- [ ] List
- [ ] Select and start
- [ ] Delete
- [ ] Capability gating
- [ ] Tests

## Progress

Not started.
