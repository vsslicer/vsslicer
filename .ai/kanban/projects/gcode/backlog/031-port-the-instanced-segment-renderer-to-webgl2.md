---
id: 31
title: Port the instanced segment renderer to WebGL2
type: feature
priority: P0
effort: M
model: opus
area: [renderer]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [30]
created: 2026-10-25
---

libvgcode's model ported from PrusaSlicer@30ef591 `src/libvgcode/` (AGPL-3.0, provenance lines): one instanced segment template, per-move attributes in data textures.

## Acceptance criteria

- [ ] The corpus renders; data textures are chunked and tested with a 16k `MAX_TEXTURE_SIZE`
- [ ] Visibility is a contiguous range plus role/travel/tool filters in the shader
- [ ] Resources free on dispose (test)

## Tasks

- [ ] Port segment geometry
- [ ] Data-texture chunking
- [ ] Visibility range and filters
- [ ] Dispose

## Progress

Not started.
