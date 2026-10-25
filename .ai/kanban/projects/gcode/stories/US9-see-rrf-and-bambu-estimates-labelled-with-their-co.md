---
id: US9
title: "See RRF and Bambu estimates labelled with their confidence"
status: reviewed
epic: VSS:E4
---

As an RRF or Bambu user, I want an estimate that tells me how far to trust it, so a closed or less verified firmware model is not presented as exact.

## Acceptance criteria

- [ ] RRF planner passes unit tests for M566 conversion; results are labelled lower confidence until the RRF 3.6 source spike is recorded
- [ ] Bambu results carry `estimate: true` with Marlin-model limits from the profile and the file's M204/M205
- [ ] Three H2C prints are measured against our estimate and Bambu Studio's; firmware version and date and the error are recorded, not gated

## Out of scope

- Printer-live limits (PRN, I4)
