---
id: 41
title: "Send pause, resume and stop over MQTT"
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US9
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [39]
created: 2026-10-25
---

`print.pause`, `print.resume` and `print.stop` publishes with sequence ids and result matching.

**Code:** `vsslicer/modules/printer-bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] The fake broker records the exact command payloads (golden); a rejected command surfaces as a typed error
- [ ] Commands are refused client-side with `unsupported` in read-only mode

## Tasks

- [ ] Command builders
- [ ] Result matching
- [ ] Golden tests

## Progress

Not started.
