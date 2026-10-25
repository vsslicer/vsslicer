---
id: 76
title: "Make `CuraEngine` a `SlicerEngine`: resolve, export, run"
type: feature
priority: P1
effort: M
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
depends_on: [74, 75, 73, 64, 7]
created: 2026-10-25
---

Composes `resolveCuraStack`, STL export, the input writer and the runner behind the common interface. The Cura stack of the resolved profile comes from `profiles`.

**Code:** `vsslicer/modules/slicer-cura/src/application/...` (module: `slicer-cura`, layer: `application`)

## Acceptance criteria

- [ ] The contract suite passes against `CuraEngine` with a stub binary
- [ ] The fixture cube slices with the real CuraEngine locally
- [ ] Resolution errors (unsupported function) surface with key and function named

## Tasks

- [ ] Compose
- [ ] Contract suite
- [ ] Local smoke test

## Progress

Not started.
