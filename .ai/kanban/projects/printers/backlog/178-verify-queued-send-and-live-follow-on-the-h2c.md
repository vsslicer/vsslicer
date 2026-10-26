---
id: 178
title: Verify queued send and live follow on the H2C
type: chore
priority: P1
effort: M
model: opus
area: [daemon, bambu]
story: US32
milestone: "VSS:M3"
sprint: "VSS:SP31"
depends_on: [175, 173, 148]
created: 2026-10-25
---

Manual hardware checklist per D5.

**Code:** `vsslicer/modules/printers-extension/docs/h2c-queue-follow-checklist.md` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] On the H2C (firmware recorded): a queued send of a `.gcode.3mf` while the window reloads completes
- [ ] Follow during the print with the precision the printer reports (line number or percent) recorded

## Tasks

- [ ] Checklist
- [ ] Run with the owner
- [ ] Record

## Progress

Not started.
