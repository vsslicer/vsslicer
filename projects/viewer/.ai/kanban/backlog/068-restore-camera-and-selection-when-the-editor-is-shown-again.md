---
id: 68
title: Restore camera and selection when the editor is shown again
type: feature
priority: P0
effort: M
model: sonnet
area: [viewer]
story: US23
milestone: "VSS:M2"
depends_on: [56, 60, PLT-40]
created: 2026-10-25
---

`getState`/`setState` and a measured choice of `retainContextWhenHidden` by size.

**Code:** `vsslicer/modules/project-extension/src/presentation/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Hide then show restores camera and selection (integration test)
- [ ] Measurement on the 5 M fixture recorded and the per-size choice implemented

## Tasks

- [ ] State save and restore
- [ ] Measure retain versus reload
- [ ] Test

## Progress

Not started.
