---
id: 69
title: Release GPU resources on dispose with a heap test
type: feature
priority: P0
effort: S
model: sonnet
area: [viewer]
story: US23
milestone: "VSS:M2"
depends_on: [55, PLT-40]
created: 2026-10-25
---

Dispose geometry, textures, renderer and workers when the editor closes.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Opening and closing the editor 20 times leaves the heap flat within a tolerance (heap snapshot test)

## Tasks

- [ ] Dispose paths
- [ ] Heap test

## Progress

Not started.
