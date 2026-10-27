---
id: 51
title: Cache resolved chains and meet the 5 ms resolve budget
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US22
milestone: "VSS:M2"
sprint: "VSS:SP13"
depends_on: [49, 46, 135]
created: 2026-10-25
---

Cached chains invalidated by the watcher so 1 000 resolutions over the full Orca tree stay fast.

**Code:** `vsslicer/modules/profiles/profiles/src/application/resolve/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] Resolving 1 000 times over the full Orca tree index stays under 5 ms per call on CI (benchmark test with the CI machine noted)
- [ ] Editing a parent file invalidates exactly the dependent chains (test counts recomputations)

## Tasks

- [ ] Add the cache
- [ ] Invalidate via the change events
- [ ] Benchmark test

## Progress

Not started.
