---
id: 28
title: "Compare our time estimate with Orca's own on the fixtures"
type: chore
priority: P1
effort: S
model: sonnet
area: [orca, engine]
story: US7
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [27, GCP-8, GCP-24]
created: 2026-10-25
---

Checks that the planner estimate on Orca's G-code is within the I5 tolerance of the estimate in Orca's own header.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] For each fixture plate our estimate is within 10 percent of Orca's own estimate (tolerance recorded here and in the test)
- [ ] The test prints both numbers and fails with them when out of tolerance

## Tasks

- [ ] Read the header estimate with `readSummary`
- [ ] Plan with the Marlin planner
- [ ] Assert

## Progress

Not started.
