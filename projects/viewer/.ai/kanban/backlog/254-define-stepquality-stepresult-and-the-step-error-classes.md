---
id: 254
title: "Define StepQuality, StepResult and the STEP error classes"
type: feature
priority: P1
effort: S
model: sonnet
area: [step, mesh]
story: US69
milestone: "VSS:M4"
depends_on: [251, 75]
created: 2026-10-25
---

Types for the quality (linear and angular deflection with named presets), the result (solids with names and `IndexedMesh`) and four typed errors with user messages: unsupported schema, empty file, WASM load failure, out of memory.

**Code:** `vsslicer/modules/mesh-step/src/domain/` (module: `mesh-step`, layer: `domain`)

## Acceptance criteria

- [ ] Each error has a distinct class and a message that says what to do
- [ ] Quality presets are monotonic in both deflections
- [ ] No I/O in the folder

## Tasks

- [ ] Types
- [ ] Messages
- [ ] Tests

## Progress

Not started.
