---
id: 429
title: Pass the contract kit on the recorded Anycubic LAN fixtures
type: chore
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [428, 424]
created: 2026-10-25
---

Runs the `@vsslicer/printer-api` contract kit (and its HTTP/WebSocket replay harness where the protocol uses them) against the Anycubic LAN adapter with the recorded fixtures.

**Code:** `vsslicer/modules/printer-unofficial-anycubic/test/contract/` (module: `printer-unofficial-anycubic`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] Connect, status, subscribe, job gating and upload checks pass on the fixtures; failure injection (4xx, 5xx, timeout, mid-stream close) maps to the typed `PrinterError` kinds
- [ ] No test needs a printer or the network (D5); the run is part of `node scripts/run.mjs ci`

## Tasks

- [ ] Wire the kit
- [ ] Failure injection cases
- [ ] CI entry

## Progress

Not started.
