---
id: US10
title: "Know the cost of parsing 1, 5 and 20 million triangles"
status: reviewed
epic: VSS:E9
---

As the viewer's author, I want measured parse, dedup and BVH times and peak memory at 1, 5 and 20 M triangles, so that the viewer's size budgets and the bounding-box fallback rest on numbers.

## Acceptance criteria

- [ ] A spike measures parse plus dedup plus BVH build for STL at 1, 5 and 20 M triangles in a worker and records time and peak memory
- [ ] The final numbers, measured on the real library in CI, are published as the input to E10's budgets
- [ ] The result says whether 20 M triangles fits; if not, the E10 bounding-box placeholder with "draw anyway" is confirmed as the fallback
- [ ] Verified only on fixtures (D5)

## Out of scope

- Rendering frame times (US24)
