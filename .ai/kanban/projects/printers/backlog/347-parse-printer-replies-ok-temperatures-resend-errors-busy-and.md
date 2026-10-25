---
id: 347
title: "Parse printer replies: ok, temperatures, resend, errors, busy and actions"
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [344]
created: 2026-10-25
---

Pure parser from reply lines to typed events. Written new from the protocol; Marlin is GPL-3.0 and no Marlin code is copied.

**Code:** `vsslicer/modules/printer-serial/src/domain/...` (module: `printer-serial`, layer: `domain`)

## Acceptance criteria

- [ ] `ok`, `ok T:.. /.. B:.. /..`, `Resend: n`, `rs n`, `Error:Line Number is not Last Line Number+1`, `Error:checksum mismatch`, `echo:busy: processing`, `// action:...` and `SD printing byte x/y` / `Not SD printing` parse to events on the recorded transcripts
- [ ] Unknown lines become `info` events, never exceptions; partial lines are buffered until the newline (fuzz test with random chunking)
- [ ] Multi-extruder and heated-chamber temperature forms parse

## Tasks

- [ ] Event types
- [ ] Line assembler
- [ ] Parsers and tests

## Progress

Not started.
