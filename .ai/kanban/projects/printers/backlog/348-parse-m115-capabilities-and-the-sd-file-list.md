---
id: 348
title: Parse `M115` capabilities and the SD file list
type: feature
priority: P2
effort: S
model: sonnet
area: [serial]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [347]
created: 2026-10-25
---

Turns the `M115` reply into firmware info and capability flags (`Cap:LONG_FILENAME`, `LFN_WRITE`, `EXTENDED_M20`, `BINARY_FILE_TRANSFER`, `SDCARD`, `AUTOREPORT_TEMP`) and parses `M20` and `M20 L` lists. Written new from the protocol; Marlin is GPL-3.0 and no Marlin code is copied.

**Code:** `vsslicer/modules/printer/serial/src/domain/...` (module: `printer-serial`, layer: `domain`)

## Acceptance criteria

- [ ] Recorded replies from Marlin 1.1.x, 2.0.x and 2.1.x with and without long-filename support give the expected flags, including `longFilenames = LONG_FILENAME && EXTENDED_M20`
- [ ] `M20` lists with 8.3 names and the `M20 L` form with sizes and long names parse; names with spaces survive
- [ ] A reply with none of the capabilities gives all-false, not an error

## Tasks

- [ ] Capability parser
- [ ] SD list parser
- [ ] Table tests over the fixtures

## Progress

Not started.
