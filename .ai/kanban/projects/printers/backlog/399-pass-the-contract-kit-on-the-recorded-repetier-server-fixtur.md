---
id: 399
title: Pass the contract kit on the recorded Repetier-Server fixtures
type: chore
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [398, 394]
created: 2026-10-25
---

Runs the `@vsslicer/printer-api` contract kit (and its HTTP/WebSocket replay harness where the protocol uses them) against the Repetier-Server adapter with the recorded fixtures.

**Code:** `vsslicer/modules/printer/unofficial-repetier/test/contract/` (module: `printer-unofficial-repetier`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] Connect, status, subscribe, job gating and upload checks pass on the fixtures; failure injection (4xx, 5xx, timeout, mid-stream close) maps to the typed `PrinterError` kinds
- [ ] No test needs a printer or the network (D5); the run is part of `node scripts/run.mjs ci`

## Tasks

- [ ] Wire the kit
- [ ] Failure injection cases
- [ ] CI entry

## Progress

Not started.
