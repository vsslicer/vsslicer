---
id: 89
title: "Effect tests: infill patterns and arc fitting"
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US29
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [87, GCP-9]
created: 2026-10-25
---

Infill pattern enum values per engine (infill paths differ per value) and arc fitting (G2/G3 present and parsed).

**Code:** `vsslicer/modules/common/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] Each pattern value produces a measurably different infill path set (path statistics) from the others
- [ ] Arc fitting on: G2/G3 present and tessellated by the parser; off: absent
- [ ] Engines without arc fitting are skipped with an `unsupported` assertion

## Tasks

- [ ] Pattern fixtures
- [ ] Arc fixture
- [ ] Assertions

## Progress

Not started.
