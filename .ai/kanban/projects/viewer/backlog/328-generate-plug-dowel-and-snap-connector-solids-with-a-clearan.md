---
id: 328
title: "Generate plug, dowel and snap connector solids with a clearance"
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US88
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [319]
created: 2026-10-25
---

Builds the male and female solids for plug, dowel and snap connectors (prism or frustum style; triangle, square, hexagon or circle section; size, depth, rotation) with the clearance applied to the hole only. The model follows the connector types of `OrcaSlicer@09aa0114:src/libslic3r/CutUtils.cpp` and the connector types of `Model.hpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/core/mesh-boolean/src/domain/connectors/` (module: `mesh-boolean`, layer: `domain`)

## Acceptance criteria

- [ ] For every type, style and shape the plug and the hole differ only by the configured clearance (distance between the surfaces measured on fixtures)
- [ ] Each solid is closed and manifold by the statistics
- [ ] Parameters outside sane limits give a typed error with the limit
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port connector types
- [ ] Solid generation
- [ ] Clearance rule
- [ ] Fit tests

## Progress

Not started.
