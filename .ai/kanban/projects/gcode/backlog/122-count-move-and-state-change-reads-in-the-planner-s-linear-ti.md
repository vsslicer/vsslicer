---
id: 122
title: "Count move and state-change reads in the planner's linear-time test"
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP33"
created: 2026-10-26
---

From GCP-119's passing review (SP10): the planner's read count covers only the markers list. A quadratic loop over moves, or over a copied marker list, passes both tests (the 300k-move hang guard finishes in 20 to 23 s, under its 60 s timeout).

**Code:** `vsslicer/modules/core/gcode-planner/test/planner.test.ts` (tests)

## Acceptance criteria

- [ ] Count reads of the parsed file's move and state-change arrays (as the markers count does) with the same doubling-ratio check, so a per-move scan of moves fails
- [ ] Probe B and C from the GCP-119 review (quadratic over moves; scanning a copied marker list) each fail a test; no wall-time assert (rule 26)

## Progress

Not started.
