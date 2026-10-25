---
id: US24
title: "A maintainer proves the open adapters against emulators and recorded fixtures"
status: reviewed
epic: VSS:E23
---

As a maintainer with only an H2C (D5), I want a shared HTTP and WebSocket replay harness, emulator spikes and a CI job for each family, so that Moonraker, OctoPrint, PrusaLink and Duet are tested without the hardware.

## Acceptance criteria

- [ ] The replay harness is in `@vsslicer/printer-api/testing` and used by all four connectors
- [ ] A 1-day spike for each of the OctoPrint virtual printer and a Moonraker simulator in CI records feasibility; fallback is recorded fixtures
- [ ] Fixtures carry a PROVENANCE note stating how they were recorded or derived

## Out of scope

- Real-hardware testing.
