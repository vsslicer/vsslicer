---
id: 176
title: "Add the Cura table entries: input shaping, junction deviation and adaptive PA"
type: feature
priority: P2
effort: S
model: sonnet
area: [cura]
story: US49
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [175, 92]
created: 2026-10-25
---

Adds entries for the motion keys; CuraEngine writes none of these commands, so entries are `unsupported` unless the pinned engine proves otherwise.

**Code:** `vsslicer/modules/slicer-cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and the coverage check passes
- [ ] Each `unsupported` entry has a one-line reason
- [ ] The effect test (SA6) for a supported entry is named in the entry

## Tasks

- [ ] Check the keys against the catalogue
- [ ] Write the entries
- [ ] Run the table validator and coverage check

## Progress

Not started.
