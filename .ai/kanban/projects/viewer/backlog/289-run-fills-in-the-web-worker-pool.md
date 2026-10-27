---
id: 289
title: Run fills in the Web Worker pool
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh, painting]
story: US82
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [284, 285, 49]
created: 2026-10-25
---

Bucket, smart and gap fill over large regions run in the webview's worker pool so a fill on a dense mesh does not freeze the viewer; brush strokes stay on the main thread.

**Code:** `vsslicer/modules/core/mesh/src/adapters/worker-web/paint.ts` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] A fill on the 1 M fixture runs in a worker in headless Chromium and returns a delta
- [ ] The main thread stays responsive (longest task under 50 ms during the fill)
- [ ] Works under the kit CSP like the parsing pool

## Tasks

- [ ] Worker entry
- [ ] Browser test

## Progress

Not started.
