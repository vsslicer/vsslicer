---
id: 173
title: Show the changed presets and the three-way view
type: feature
priority: P2
effort: M
model: sonnet
area: [form]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [172, 169, 79]
created: 2026-10-25
---

A view of changed presets and, for each user entity with conflicts, a base/mine/vendor table built from the form's comparison components, where the user picks a side per conflicting key.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/...` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] For the update fixture the view shows the right three values per conflicting key and nothing for clean merges
- [ ] Picking a side per key is stored and used by apply; keyboard navigation works

## Tasks

- [ ] Changed list
- [ ] Three-way table
- [ ] Choice state

## Progress

Not started.
