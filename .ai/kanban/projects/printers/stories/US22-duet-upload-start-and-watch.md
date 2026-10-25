---
id: US22
title: "A Duet user uploads to RRF or DSF, starts and watches the job"
status: reviewed
epic: VSS:E23
---

As a Duet user, I want upload, start and status for both RepRapFirmware standalone and the Duet Software Framework, so that Duet boards work from VS Code.

## Acceptance criteria

- [ ] The contract kit passes for RRF (`rr_*` with session key) and DSF (`/machine/*` with WebSocket patches) against recorded fixtures
- [ ] RRF upload verifies `crc32`; the session expiry and re-login are tested
- [ ] Start uses `M32`; RRF is polled, DSF is pushed
- [ ] Verified on fixtures only (D5); if the epic runs long, DSF moves to a follow-up story

## Out of scope

- Duet web control and macros.
