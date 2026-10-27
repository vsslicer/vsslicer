---
id: 306
title: Render the per-triangle state overlay with a custom shader
type: feature
priority: P2
effort: M
model: opus
area: [viewer, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [55, 291, 300]
created: 2026-10-25
---

Draws the leaf triangles of each layer over the mesh in a custom shader on the `WebGLRenderer`: enforcer, blocker, seam and filament colours, with a stroke updating only the changed triangles.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/render/paint/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A painted fixture renders its regions in the right colours (snapshot)
- [ ] A stroke uploads only the changed triangles (counted)
- [ ] Uses theme tokens for the support and seam colours; WebGL2 only

## Tasks

- [ ] Shader
- [ ] Partial upload
- [ ] Snapshots

## Progress

Not started.
