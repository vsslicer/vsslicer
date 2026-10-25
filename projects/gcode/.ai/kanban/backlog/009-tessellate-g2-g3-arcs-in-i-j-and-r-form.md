---
id: 9
title: Tessellate G2/G3 arcs in I/J and R form
type: feature
priority: P0
effort: L
model: sonnet
area: [parser]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [3]
created: 2026-10-25
---

Module: `gcode-parser`, layer `domain`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Renderer and later epics draw only straight segments. Ports the R-form centre and discretisation rule from PrusaSlicer@30ef591 libpgcode `ProcessorImpl.cpp:929-975, 1120-1206` (AGPL-3.0, provenance lines per D2).

## Acceptance criteria

- [ ] Unit tests: I/J and R forms, full circles, negative R, planes G18/G19
- [ ] Inconsistent radius gives a diagnostic and a straight move
- [ ] Each tessellated segment is flagged with its source arc

## Tasks

- [ ] Port the centre and discretisation code with notices
- [ ] Plane handling
- [ ] Chord-tolerance tessellation into the buffer
- [ ] Diagnostic for bad radius

## Progress

Not started.
