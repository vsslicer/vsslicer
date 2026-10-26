---
id: 319
title: Define the cut and boolean types and errors
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh]
story: US87
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [317, 75]
created: 2026-10-25
---

Types for `CutPlane` (point and normal), `CutOptions` (keep upper, lower or both, to parts or objects, connectors), `BooleanOp` and the results, plus typed errors: non-manifold input, WASM unavailable, empty result, cancelled.

**Code:** `vsslicer/modules/mesh-boolean/src/domain/types.ts` (module: `mesh-boolean`, layer: `domain`)

## Acceptance criteria

- [ ] Each error class carries the data its message needs (operand, edge count)
- [ ] No I/O and no WASM import in the folder (lint)
- [ ] Type tests pass

## Tasks

- [ ] Types
- [ ] Errors
- [ ] Tests

## Progress

Not started.
