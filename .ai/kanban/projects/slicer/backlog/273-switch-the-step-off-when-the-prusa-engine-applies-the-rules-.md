---
id: 273
title: Switch the step off when the Prusa engine applies the rules itself
type: feature
priority: P2
effort: S
model: sonnet
area: [postprocess]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [270, 238, 106]
created: 2026-10-25
---

Reads the engine's capability table and skips the built-in substitution step for an engine whose `gcode_substitutions` entry is applied by the engine.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] With the Prusa engine, the rules are applied once (fake engine marks the key supported; the step reports "skipped: engine applies it")
- [ ] With Orca or Cura the step runs
- [ ] No engine selected falls back to running the step

## Tasks

- [ ] Table lookup
- [ ] Skip reason
- [ ] Tests

## Progress

Not started.
