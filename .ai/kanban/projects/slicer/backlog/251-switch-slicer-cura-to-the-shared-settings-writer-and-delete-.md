---
id: 251
title: Switch slicer-cura to the shared settings writer and delete its copy
type: refactor
priority: P2
effort: S
model: sonnet
area: [cura, embedded]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [250, 72]
created: 2026-10-25
---

Raises the `cura-settings` range to `^0.2.0`, calls the shared writer, removes the local one.

**Code:** `vsslicer/modules/slicer-cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] All existing `slicer-cura` tests pass unchanged; the oracle tuples slice with the same result
- [ ] No local copy of the writer remains (grep in the test)
- [ ] The module builds alone against the published range

## Tasks

- [ ] Raise range
- [ ] Switch callers
- [ ] Delete copy

## Progress

Not started.
