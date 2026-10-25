---
id: 236
title: Check load-time repair against admesh on the fixtures on three operating systems
type: feature
priority: P1
effort: M
model: sonnet
area: [mesh, repair]
story: US63
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [234, 228, 45]
created: 2026-10-25
---

Runs `repairOnLoad` on every defect fixture and compares the result with admesh's report.

**Code:** `vsslicer/modules/mesh/test/repair/onload/` (module: `mesh`, layer: n/a (tests))

## Acceptance criteria

- [ ] Open and non-manifold edge counts after repair equal admesh's
- [ ] Passes on Linux, macOS and Windows runners
- [ ] Differences are listed in the CI log

## Tasks

- [ ] Comparison harness
- [ ] CI matrix

## Progress

Not started.
