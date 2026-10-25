---
id: 368
title: Run the contract kit against the emulator with noise
type: chore
priority: P2
effort: M
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [367, 356, 355]
created: 2026-10-25
---

Runs the printer-api contract kit against the adapter through the emulator, over the pty pair where available, with the noise profile on.

**Code:** `vsslicer/modules/printer-serial/test/contract/` (module: `printer-serial`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] Connect, status, subscribe, job gating, upload and follow-position checks pass with injected line noise, resends and busy periods
- [ ] The run is deterministic by seed and CI prints the seed on failure
- [ ] SD upload and BFT checks run in a second suite and pass

## Tasks

- [ ] Wire the contract kit
- [ ] Noise profile
- [ ] CI job

## Progress

Not started.
