---
id: US3
title: "An adapter author proves an adapter with the contract kit and the state tables"
status: reviewed
epic: VSS:E20
---

As an adapter author, I want a contract test kit, a fake in-memory adapter and state-normalisation tables, so that I can run one suite against my recorded fixtures and know the adapter behaves like every other, and so the API is checked against Bambu and Moonraker before it is frozen at 0.1.

## Acceptance criteria

- [ ] The contract kit (`@vsslicer/printer-api/testing`) passes against the fake adapter in CI: connect, status, subscribe/unsubscribe, upload with progress and abort, job commands gated by capability, every `PrinterError` kind, push and poll adapters
- [ ] State normalisation unit tests have a case per state named in `printer-connectivity.md` section 1 (PrusaLink's nine states, Moonraker `print_stats.state`) and the Bambu `gcode_state` values from ha-bambulab `mock_data` (MIT)
- [ ] The kit also asserts the follow-position rules (offsets monotonic during a job, reset on a new job, null when unknown)
- [ ] API review sign-off: the Bambu spike findings (PRN-1) and a Moonraker adapter are sketched against the types, and the findings are recorded before the API is released as 0.1
- [ ] Verified only on fixtures and the fake adapter; the H2C is first used in E21 (D5)

## Out of scope

- Per-family adapters; the HTTP replay harness (US24).
