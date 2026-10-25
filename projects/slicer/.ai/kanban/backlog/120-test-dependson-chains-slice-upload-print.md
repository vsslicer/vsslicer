---
id: 120
title: "Test `dependsOn` chains: slice, upload, print"
type: chore
priority: P1
effort: M
model: sonnet
area: [tasks]
story: US23
milestone: "VSS:M3"
depends_on: [117, 119, PLT-15]
created: 2026-10-25
---

Integration tests of the task chains in the extension host.

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] `slice` then `upload` then `print` run in order
- [ ] A failed `slice` stops `upload` and `print`
- [ ] A failed `upload` stops `print`

## Tasks

- [ ] Chain fixtures
- [ ] Tests

## Progress

Not started.
