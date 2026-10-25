---
id: 161
title: Diff two vendor versions into a change set
type: feature
priority: P2
effort: M
model: sonnet
area: [store]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [159, 136]
created: 2026-10-25
---

Pure function from two sets of vendor entities to added, removed, changed (with the changed keys) and renamed (via `renamed_from`) presets.

**Code:** `vsslicer/modules/profiles/src/domain/...` (module: `profiles`, layer: `domain`)

## Acceptance criteria

- [ ] The fixtures give the expected change sets for each ecosystem; a rename is reported as a rename, not remove plus add
- [ ] Property test: diffing a tree with itself is empty, and applying the change set to v1 gives v2

## Tasks

- [ ] Types
- [ ] Diff
- [ ] Tests

## Progress

Not started.
