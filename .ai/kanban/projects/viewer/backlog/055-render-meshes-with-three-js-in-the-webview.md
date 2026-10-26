---
id: 55
title: Render meshes with three.js in the webview
type: feature
priority: P0
effort: L
model: opus
area: [viewer]
story: US16
milestone: "VSS:M2"
sprint: "VSS:SP16"
depends_on: [54, PLT-37, PLT-41]
created: 2026-10-25
---

three.js `WebGLRenderer` scene: materials, lighting, upload of IndexedMesh to geometry and per-object colours. WebGL2 only (D6).

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/render/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Fixture meshes render with correct bounds and orientation
- [ ] Uses the kit's WebGL2 context factory result and theme tokens
- [ ] Memory per triangle recorded

## Tasks

- [ ] Scene and renderer
- [ ] Geometry upload
- [ ] Lighting and colours
- [ ] Test

## Progress

Not started.
