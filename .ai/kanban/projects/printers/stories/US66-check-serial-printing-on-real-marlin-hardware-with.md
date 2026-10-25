---
id: US66
title: "Check serial printing on real Marlin hardware with a contributor checklist"
status: reviewed
epic: VSS:E59
---

As a contributor with a Marlin printer, I want a checklist that records what I verified on real hardware, so that the emulator-only coverage (no Marlin printer, D5) can be backed by reports.

## Acceptance criteria

- [ ] The checklist covers streaming with checksums, resend on a deliberately bad cable or injected noise tool, SD upload, BFT, and `M115` capture, and says how to attach recorded transcripts as fixtures

## Out of scope

- Running the checklist on the H2C (it has no USB serial print path).
