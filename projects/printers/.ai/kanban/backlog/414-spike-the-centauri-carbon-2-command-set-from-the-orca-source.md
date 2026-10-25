---
id: 414
title: "Spike: the Centauri Carbon 2 command set from the Orca source"
type: spike
priority: P2
effort: M
model: opus
area: [unofficial]
story: US70
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [413]
created: 2026-10-25
---

Reads `OrcaSlicer@09aa0114` `src/slic3r/Utils/ElegooLink.cpp` (`system/info` with `X-Token` at :82,369-408, chunked upload :892, token headers :485,582,934) and records the CC2 command set: info, status, upload chunking, start, with what is verified, derived and unknown. The CC2 is not in the SDCP document and its provenance is unverified.

**Code:** `vsslicer/modules/printer-unofficial-elegoo-cc2/docs/cc2-protocol.md` (module: `printer-unofficial-elegoo-cc2`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A document lists every request the source makes with method, path, headers, body shape and response fields used, citing file and line
- [ ] It states what is unknown (pause, stop, firmware range, token acquisition) so the adapter cards do not invent it
- [ ] Written to `vsslicer/modules/printer-unofficial-elegoo-cc2/docs/cc2-protocol.md`

## Tasks

- [ ] Read the source
- [ ] Write the document

## Progress

Not started.
