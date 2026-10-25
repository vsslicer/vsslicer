---
id: US8
title: "Get a Marlin 2 or Prusa Buddy print time estimate"
status: reviewed
epic: VSS:E4
---

As a PrusaSlicer or Marlin user, I want a time estimate that agrees with the slicer's own M73 numbers, so the estimate is believable.

## Acceptance criteria

- [ ] Within 2 percent of PrusaSlicer's M73 normal-mode totals and per-layer progress on its fixtures; the tolerance is confirmed or tightened and recorded as a decision
- [ ] Unit tests per rule (junction at 90 and 180 degrees, 16-block lookahead, linear-advance cap, arc segmentation count)
- [ ] Unknown flavour uses Marlin and says so

## Out of scope

- Klipper (US7)
