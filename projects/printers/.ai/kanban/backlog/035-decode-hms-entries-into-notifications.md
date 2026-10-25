---
id: 35
title: Decode HMS entries into notifications
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US11
milestone: "VSS:M3"
sprint: "VSS:SP10"
depends_on: [31, 14, 32]
created: 2026-10-25
---

`hms` array entries become `PrinterStatus.notifications` with code, severity and a link to Bambu's public HMS wiki page.

**Code:** `vsslicer/modules/printer-bambu/src/domain/...` (module: `printer-bambu`, layer: `domain`)

## Acceptance criteria

- [ ] Fixture HMS entries decode to code and severity and the wiki URL pattern; an unknown code still produces a notification
- [ ] Any text table copied (ha-bambulab, MIT) has a PROVENANCE line; wiki prose is linked, not copied

## Tasks

- [ ] Decoder
- [ ] Link builder
- [ ] Tests

## Progress

Not started.
