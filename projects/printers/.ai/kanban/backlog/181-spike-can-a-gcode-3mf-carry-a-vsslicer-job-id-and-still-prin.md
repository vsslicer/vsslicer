---
id: 181
title: "Spike: can a .gcode.3mf carry a VSSlicer job id and still print on the H2C"
type: spike
priority: P1
effort: S
model: opus
area: [history, bambu]
story: US51
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [180, VWR-74, 48]
created: 2026-10-25
---

Find the metadata entry that a `.gcode.3mf` can carry for the job id without the H2C firmware refusing or dropping it, before the format is fixed.

**Code:** `vsslicer/modules/job-history/` (module: `job-history`, layer: `n/a (spike)`)

Verified on the H2C (D5); the entry survives a round trip through `@vsslicer/3mf` on fixtures.

## Acceptance criteria

- [ ] A note in `vsslicer/modules/job-history/docs/` records the entry name and part, the `@vsslicer/3mf` calls used, the H2C firmware version, and whether the print started and finished
- [ ] A file with the entry sent through the 3mf send path still prints on the H2C
- [ ] Fallback decided if the H2C rejects it (history records from the sender side only)

## Tasks

- [ ] Add the entry with `@vsslicer/3mf`
- [ ] Send to the H2C and print
- [ ] Write the decision

## Progress

Not started.
