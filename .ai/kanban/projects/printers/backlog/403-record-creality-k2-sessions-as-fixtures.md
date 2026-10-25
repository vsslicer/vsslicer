---
id: 403
title: Record Creality K2 sessions as fixtures
type: chore
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [402]
created: 2026-10-25
---

Protocol exchanges for the adapter's tests, derived from `OrcaSlicer@09aa0114` `src/slic3r/Utils/CrealityPrint.cpp` (`upload` :140, `query_boxes_info` :357, `start_print` :376) and `CrealityHostDiscovery.cpp`: `get` replies, `boxsInfo`, `colorMatch`, `multiColorPrint`, `GET /info`, the upload response. The port-9999 protocol is not documented by Creality (provenance unverified); no firmware numbers are stated by any source, because no such printer is available (D5).

**Code:** `vsslicer/modules/printer-unofficial-creality/test/fixtures/` (module: `printer-unofficial-creality`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] PROVENANCE.md states for each session whether it was recorded from a device or derived from the cited source, and which firmware it applies to or that none is stated
- [ ] No vendor code is copied; anything ported under D2 carries its notice and a `Ported from` line
- [ ] The fixtures check (size cap and PROVENANCE) passes

## Tasks

- [ ] Derive or record the sessions
- [ ] PROVENANCE
- [ ] Run the fixtures check

## Progress

Not started.
