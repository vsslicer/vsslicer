---
id: 88
title: "Effect tests: Arachne walls and tree supports"
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US28
milestone: "VSS:M3"
depends_on: [87]
created: 2026-10-25
---

Two rows: wall generator enum (varying extrusion widths in walls) and support type (support role present, tree footprint differs from normal supports by coarse per-layer statistics).

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] Wall test: widths in outer and inner walls vary with Arachne and are constant with the classic generator
- [ ] Support test: with tree supports the per-layer support footprint statistic differs from normal supports by a documented margin
- [ ] Each test names its regression

## Tasks

- [ ] Fixtures for thin walls and overhang
- [ ] Assertions
- [ ] Document the statistics

## Progress

Not started.
