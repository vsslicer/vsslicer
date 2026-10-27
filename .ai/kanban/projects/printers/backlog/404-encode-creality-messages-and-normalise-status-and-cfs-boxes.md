---
id: 404
title: Encode Creality messages and normalise status and CFS boxes
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [403]
created: 2026-10-25
---

Pure codec for `{"method":"get|set","params":{...}}` messages, the status fields the adapter reads, and the CFS types (`boxsInfo` boxes and slots, `colorMatch`, `multiColorPrint`). Written new from the protocol as `OrcaSlicer@09aa0114` shows it; any code ported from Orca (AGPL-3.0) is allowed under D2 and then carries the notice and a `Ported from` line.

**Code:** `vsslicer/modules/printer/unofficial-creality/src/domain/...` (module: `printer-unofficial-creality`, layer: `domain`)

## Acceptance criteria

- [ ] The fixtures decode to typed status and CFS values; a missing field gives `unknown`, not an exception
- [ ] Colour-match and multi-colour-print messages for 2 and 4 colours encode byte-equal to the fixtures
- [ ] State names map to the normalised states with the raw value kept

## Tasks

- [ ] Message types
- [ ] Status mapping
- [ ] CFS types
- [ ] Tests

## Progress

Not started.
