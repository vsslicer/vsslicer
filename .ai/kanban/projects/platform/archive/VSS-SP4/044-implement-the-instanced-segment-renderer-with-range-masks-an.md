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
sprint: "VSS:SP4"
owner: PLT-44-worker
depends_on: [42]
created: 2026-10-25
---

One instanced segment template, visibility as contiguous first/count range plus role and travel masks, colouring in the shader from per-move scalars and a palette texture. May port libvgcode shader code from PrusaSlicer under D2 with the upstream copyright line and a `Ported from PrusaSlicer@<commit>:<path>` line.

## Acceptance criteria

- [x] Draws a fixed synthetic move set at two ranges
- [x] Colour modes feature, speed, tool and layer-time selectable through uniforms
- [x] Ported files carry upstream copyright and provenance lines (checked by `tools/check-licence`)

## Tasks

- [x] Study libvgcode shaders (read only)
- [x] Write shaders and draw loop
- [x] Add palette texture
- [x] Add range and mask uniforms

## Progress

Done. `createSegmentRenderer(gl, moves, { layerStarts?, maxTextureSize? })` in the `gl` entry (webview-kit, gl layer, unreleased): one 8-corner prism template per visible move via `drawElementsInstanced` (corner from `gl_VertexID`, no vertex buffer), move data from PLT-42's data textures, palette texture (roles, tools, 11-stop gradient) and RG32UI layer table uploaded once. `draw(view)` sets uniforms only: global `first`/`count` range intersected per chunk, `roleMask`, `hiddenFlags` (MoveFlag bits), `colorMode` (Feature/Speed/Tool/LayerTime), `colorRange` (default `ranges`, computed at creation). Vertex placement, lighting, index list and palettes ported from OrcaSlicer@09aa0114 libvgcode with the Prusa copyright and `Ported from` lines; joints, translucency, shadows, clipping dropped. Notes: `.reference/notes/PLT-44-segment-renderer.md`.

Verified: `pnpm install && pnpm lint && pnpm test && pnpm build` pass (114 vitest tests); `pnpm test:browser` 11 passed (SwiftShader), incl. new `test/segment-renderer.spec.ts`: two ranges (layer-0 range equals the buffer cut after layer 0, pixel for pixel), maxTextureSize 4 (one segment per texture) equals one texture in all four modes, role and flag masks, each colour mode's expected hue left/right, colour range override. Mutations caught: nextStart ignored, chunkFirst 0, local record 0 drawn, flag mask removed, speed/layer-time swapped. check-licence passes for the new files and fails when the Copyright line is removed; the module-wide run currently fails only on PLT-39's `test/integration/fixture/*.js` (no SPDX header), not on this card's files.

Not done: tool colours from filament settings (fixed 8-colour palette), joint angles (caps always pointy), reverse draw order, foreign-context state save (PLT-48), no-upload spy (PLT-45), snapshots (PLT-46).

Files: `vsslicer/modules/webview-kit/src/gl/segment-shader.ts` (new), `src/gl/segment-renderer.ts` (new), `test/segment-renderer.page.ts`, `test/segment-renderer.spec.ts`, `test/segment-renderer.test.ts` (new); `src/gl/index.ts`, `README.md`, `CHANGELOG.md` (Unreleased) edited.
