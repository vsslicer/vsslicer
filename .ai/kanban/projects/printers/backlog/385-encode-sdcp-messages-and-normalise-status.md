---
id: 385
title: Encode SDCP messages and normalise status
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [384]
created: 2026-10-25
---

Pure codec for the SDCP envelope (`Id`, `Data`, topics `sdcp/request|response|status|attributes|error|notice/<MainboardID>`), the command ids (0, 1, 128 to 133, 192, 255, 258, 259) and the mapping of machine and print status codes to the normalised `PrinterStatus`. Written new from `SDCP@f977215`.

**Code:** `vsslicer/modules/printer/unofficial-sdcp/src/domain/...` (module: `printer-unofficial-sdcp`, layer: `domain`)

## Acceptance criteria

- [ ] Every message type in the fixtures decodes to a typed value; unknown status codes map to `unknown` with the raw code kept
- [ ] Request ids correlate a response to its request (property test with interleaved messages)
- [ ] Print status, layer, progress and temperatures map for the recorded print

## Tasks

- [ ] Envelope
- [ ] Command ids
- [ ] Status tables
- [ ] Tests

## Progress

Not started.
