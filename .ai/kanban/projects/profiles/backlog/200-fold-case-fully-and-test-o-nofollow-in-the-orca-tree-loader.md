---
id: 200
title: Fold case fully and test O_NOFOLLOW in the Orca tree loader
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP29"
created: 2026-10-26
---

From PRF-27's review (SP10), `vsslicer/modules/profiles-orca/src/adapters/tree/load-tree.ts`.

**Code:** `src/adapters/tree/load-tree.ts`, `test/` (adapters)

## Acceptance criteria

- [ ] Path-alias detection uses full case folding (`ſ`/`s`, `ß`/`ss`, Kelvin sign), not `toLowerCase()`, with a test per pair
- [ ] A test that fails when `O_NOFOLLOW` is removed from the file open
- [ ] A folder swapped for a link after listing is refused (re-`lstat` and compare device and inode, as profiles-cura's `folder.ts` does since PRF-30), with the remaining race documented

## Progress

Not started.
