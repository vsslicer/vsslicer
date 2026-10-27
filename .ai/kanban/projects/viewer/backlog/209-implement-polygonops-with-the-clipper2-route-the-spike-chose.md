---
id: 209
title: Implement PolygonOps with the Clipper2 route the spike chose
type: feature
priority: P1
effort: M
model: sonnet
area: [arrange]
story: US61
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [208]
created: 2026-10-25
---

The adapter over the chosen JS Clipper2 port or the WASM build. If WASM, it is loaded as a separate file.

**Code:** `vsslicer/modules/core/arrange/src/adapters/clipper/` (module: `arrange`, layer: `adapters`)

## Acceptance criteria

- [ ] The contract tests of the port pass
- [ ] Offset of the fixture footprints equals the Clipper2 reference within 0.01 mm
- [ ] Licence notice for the dependency is in place

## Tasks

- [ ] Adapter
- [ ] Contract tests
- [ ] Notice

## Progress

Not started.
