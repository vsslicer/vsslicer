---
id: 81
title: "Cancel, bad-model and bad-argument paths produce distinct messages"
type: chore
priority: P1
effort: S
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [76, 77, 10]
created: 2026-10-25
---

Stub and real engine tests for the error paths.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Cancel kills the tree and leaves no output (stub and real engine)
- [ ] A broken STL and a bad argument each produce their own typed error and message
- [ ] Messages differ from each other and from the generic crash message

## Tasks

- [ ] Stub tests
- [ ] Real engine tests

## Progress

Not started.
