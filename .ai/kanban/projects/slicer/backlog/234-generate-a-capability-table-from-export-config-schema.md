---
id: 234
title: Generate a capability table from `--export-config-schema`
type: feature
priority: P3
effort: M
model: sonnet
area: [prusa]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [218, 233]
created: 2026-10-25
---

A pure transform from the 3.0 config schema to a capability table, with a comparison against the hand table for shared keys.

**Code:** `vsslicer/modules/slicer-prusa/src/domain/...` (module: `slicer-prusa`, layer: `domain`)

## Acceptance criteria

- [ ] The generated table validates and covers the keys of the recorded schema
- [ ] For shared keys the generated entries equal the hand table's (a difference fails the test and lists the keys)
- [ ] The transform is reproducible from the recorded schema file

## Tasks

- [ ] Schema reader
- [ ] Transform
- [ ] Comparison test

## Progress

Not started.
