---
id: 164
title: Apply an update atomically with a snapshot and flag conflicts
type: feature
priority: P2
effort: M
model: opus
area: [store]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [162, 163, 160]
created: 2026-10-25
---

Stage the new version, take a snapshot, swap the vendor tree, rebase the user entities with the three-way merge (bumping `meta.base_version` where there are no conflicts), and record `source.commit` or version on the vendor.

**Code:** `vsslicer/modules/profiles/profiles/src/application/...` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] On the fixtures, user diffs survive, vendor changes arrive and conflicting entities are listed and unchanged
- [ ] Fault injection at each step (staging, snapshot, swap, rebase) leaves either the old state or the new one, never a mix (test)
- [ ] The result lists what changed so the UI can show it

## Tasks

- [ ] Use case
- [ ] Atomic swap
- [ ] Rebase
- [ ] Fault tests

## Progress

Not started.
