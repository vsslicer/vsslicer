---
id: 212
title: "Embed the job id into files at send, behind a setting"
type: feature
priority: P1
effort: M
model: sonnet
area: [daemon, history]
story: US51
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [211, 190]
created: 2026-10-25
---

Before upload, add the job id to G-code or `.gcode.3mf` when the setting is on; checksums are computed afterwards.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Moonraker fixture upload checksum matches the edited file; setting off sends the source file byte-identical (test)
- [ ] The sent record carries the id either way

## Tasks

- [ ] Pipeline hook
- [ ] Setting
- [ ] Tests

## Progress

Not started.
