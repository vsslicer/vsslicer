---
id: 395
title: Encode Repetier actions and normalise state
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [394]
created: 2026-10-25
---

Pure codec for `{action, data, printer, callback_id}` with events at `callback_id: -1`, and the mapping of `state`, `temp` and job events to `PrinterStatus`. Written new from the API documentation.

**Code:** `vsslicer/modules/printer/unofficial-repetier/src/domain/...` (module: `printer-unofficial-repetier`, layer: `domain`)

## Acceptance criteria

- [ ] Actions, replies and events in the fixtures decode to typed values; a reply is matched to its `callback_id`
- [ ] Job started, finished and killed events map to job outcomes
- [ ] Unknown actions are carried, not dropped

## Tasks

- [ ] Types
- [ ] Codec
- [ ] Normalisation
- [ ] Tests

## Progress

Not started.
