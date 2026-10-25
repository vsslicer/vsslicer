---
id: 259
title: "Write the embedded engine's capability table"
type: feature
priority: P2
effort: M
model: sonnet
area: [embedded]
story: US75
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [92, 258, 99]
created: 2026-10-25
---

The table for the embedded engine version, starting from the `slicer-cura@0.2.0` entries as data and confirmed by its own effect tests.

**Code:** `vsslicer/modules/slicer-embedded/src/domain/...` (module: `slicer-embedded`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and the coverage check passes with no unreviewed entry
- [ ] Where the embedded engine differs from `slicer-cura`'s pinned CuraEngine, the entry says so
- [ ] The engine version range is the embedded revision

## Tasks

- [ ] Copy the base entries
- [ ] Review differences
- [ ] Validate

## Progress

Not started.
