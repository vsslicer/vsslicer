---
id: US2
title: "A profile consumer merges an inheritance chain and gets typed errors for cycles and unknown parents"
status: reviewed
epic: VSS:E11
---

A developer resolving profiles calls `merge(chain)` and the override logic and gets PrusaSlicer's last-parent-wins result, with cycles and unknown parents raised as errors instead of being logged and ignored.

## Acceptance criteria

- [ ] Last parent wins; maps are deep-merged; arrays are replaced; `null` falls through
- [ ] A cycle and an unknown parent each raise a typed error naming the entities
- [ ] `overrides[]` blocks apply with `match: first` and `match: all` for a given context

## Out of scope

- Resolution over a store with provenance (E13).
