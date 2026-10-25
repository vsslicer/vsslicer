---
id: 162
title: Merge user changes over a vendor update as a three-way change
type: feature
priority: P2
effort: M
model: opus
area: [store]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [161]
created: 2026-10-25
---

For each user entity, base = the parent as of `meta.base_version`, theirs = the parent now, mine = the user's diff: keep my keys, take the vendor's changed keys, mark both-changed-differently keys as conflicts. Arrays, `overrides[]` blocks and `renamed_from` need defined rules.

**Code:** `vsslicer/modules/profiles/src/domain/...` (module: `profiles`, layer: `domain`)

## Acceptance criteria

- [ ] Every outcome in the fixtures gives the expected merged entity or conflict list; a conflict leaves the user value untouched
- [ ] Property test: with no vendor changes the result equals the input; with no user changes it equals the new parent
- [ ] Rules for arrays, override blocks and renamed parents are written in the module docs and tested

## Tasks

- [ ] Rules
- [ ] Merge
- [ ] Property tests

## Progress

Not started.
