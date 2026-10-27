---
id: 346
title: Frame G-code lines with line numbers and checksums
type: feature
priority: P2
effort: S
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [344]
created: 2026-10-25
---

Pure functions that turn a command into `N<n> <cmd>*<xor>`, strip comments, and apply `M110` resets. Written new from the protocol; Marlin is GPL-3.0 and no Marlin code is copied.

**Code:** `vsslicer/modules/printer/serial/src/domain/...` (module: `printer-serial`, layer: `domain`)

## Acceptance criteria

- [ ] Property tests: the checksum equals the XOR of every byte before `*`, framing then parsing round trips, comments and blank lines are never framed, and a line over the configured maximum is rejected with a typed error
- [ ] `M110 N<n>` resets the counter and the next line carries `n+1`
- [ ] Examples table from the Marlin documentation passes

## Tasks

- [ ] Framer
- [ ] Comment stripper
- [ ] Property tests

## Progress

Not started.
