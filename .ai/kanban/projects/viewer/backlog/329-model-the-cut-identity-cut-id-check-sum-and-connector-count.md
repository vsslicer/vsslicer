---
id: 329
title: "Model the cut identity: cut id, check sum and connector count"
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh]
story: US89
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [319]
created: 2026-10-25
---

The identity that ties the parts of one cut together so Orca can recognise them: cut id, check sum, connector count and the connector flags of a volume. Follows `CutObjectBase` and `CutId` in `OrcaSlicer@09aa0114:src/libslic3r/CutUtils.cpp` and the connector types of `Model.hpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/mesh-boolean/src/domain/cutId.ts` (module: `mesh-boolean`, layer: `domain`)

## Acceptance criteria

- [ ] Two parts of one cut share the cut id and check sum; a different cut gets a different id
- [ ] The check sum equals the value in the Orca cut fixture for the same input
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port the identity model
- [ ] Fixture check

## Progress

Not started.
