---
id: 267
title: Parse the Prusa `gcode_substitutions` rule list
type: feature
priority: P2
effort: S
model: sonnet
area: [postprocess]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [265]
created: 2026-10-25
---

Parses the serialised rule list of an imported Prusa profile into rules (find, replace, flags, notes).

**Code:** `vsslicer/modules/slicer-extension/src/domain/...` (module: `slicer-extension`, layer: `domain`)

## Acceptance criteria

- [ ] Every vector's rule text parses to the expected rules, including quoted separators and escapes
- [ ] A malformed list fails with the position of the error
- [ ] An empty value yields no rules

## Tasks

- [ ] Tokeniser
- [ ] Rule type
- [ ] Tests

## Progress

Not started.
