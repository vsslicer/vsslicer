---
id: 4
title: Detect slicer and flavour and assign roles and layers from tag sets
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M1"
depends_on: [3]
created: 2026-10-25
---

Roles and layers need the slicer's own comments.

## Acceptance criteria

- [ ] Prusa-compatible set, BBL set and Cura `;TYPE:`/`;LAYER:`/`;MESH:` give roles and layer indices on the corpus (golden role histograms)
- [ ] Slicer and flavour are detected from header lines on every fixture
- [ ] A file with no slicer tags parses with role `unknown` and a diagnostic saying why (test)
- [ ] Tag tables carry provenance lines (PrusaSlicer@30ef591 `Types.hpp:308-319`, OrcaSlicer@09aa0114 `GCodeProcessor.cpp:100-150`, AGPL-3.0 per D2)

## Tasks

- [ ] Port the tag tables with notices
- [ ] Header detection
- [ ] Layer index assignment
- [ ] No-tag fallback and diagnostic

## Progress

Not started.
