---
id: 6
title: Implement merge(chain) and chain resolution with typed errors
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US2
milestone: "VSS:M2"
depends_on: [2]
created: 2026-10-25
---

The inheritance rule every resolved profile depends on: left-to-right parents, child last, maps deep-merged, arrays replaced, `null` falls through.

**Code:** `vsslicer/modules/profile-api/src/domain/inheritance/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] Tests: last parent wins; own `settings` win over parents; maps deep-merged; arrays replaced; `null` falls through to the parent value
- [ ] A cycle raises `InheritanceCycleError` naming the loop; an unknown parent raises `UnknownParentError` naming child and parent; neither is swallowed
- [ ] `abstract` entities merge but are flagged non-selectable in the result
- [ ] A property-based test shows `merge` is associative for chains of up to 5 entities

## Tasks

- [ ] Write merge
- [ ] Write chain resolution against a lookup function
- [ ] Add typed errors and the tests

## Progress

Not started.
