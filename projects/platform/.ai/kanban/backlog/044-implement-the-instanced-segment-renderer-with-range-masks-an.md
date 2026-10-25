---
id: 44
title: "Implement the instanced segment renderer with range, masks and shader colouring"
type: feature
priority: P0
effort: L
model: opus
area: [webview-kit]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [42]
created: 2026-10-25
---

One instanced segment template, visibility as contiguous first/count range plus role and travel masks, colouring in the shader from per-move scalars and a palette texture. May port libvgcode shader code from PrusaSlicer under D2 with the upstream copyright line and a `Ported from PrusaSlicer@<commit>:<path>` line.

## Acceptance criteria

- [ ] Draws a fixed synthetic move set at two ranges
- [ ] Colour modes feature, speed, tool and layer-time selectable through uniforms
- [ ] Ported files carry upstream copyright and provenance lines (checked by `tools/check-licence`)

## Tasks

- [ ] Study libvgcode shaders (read only)
- [ ] Write shaders and draw loop
- [ ] Add palette texture
- [ ] Add range and mask uniforms

## Progress

Not started.
