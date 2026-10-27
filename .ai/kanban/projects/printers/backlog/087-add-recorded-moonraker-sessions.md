---
id: 87
title: Add recorded Moonraker sessions
type: chore
priority: P0
effort: M
model: sonnet
area: [moonraker]
story: US19
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [86, 85, PLT-13, 84]
created: 2026-10-25
---

Recorded REST and JSON-RPC WebSocket sessions: idle, print with `file_position`, pause, upload with checksum, 422 on a corrupt upload, oneshot token.

**Code:** `vsslicer/modules/printer/moonraker/test/fixtures/` (module: `printer-moonraker`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] Sessions load in the replay harness; PROVENANCE says whether recorded from the simulator or derived from the published API docs
- [ ] No Moonraker code is copied

## Tasks

- [ ] Record or derive
- [ ] PROVENANCE
- [ ] Replay self test

## Progress

Not started.
