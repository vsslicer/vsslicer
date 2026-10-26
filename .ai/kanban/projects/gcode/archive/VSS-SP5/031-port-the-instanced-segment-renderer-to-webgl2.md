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

- [x] The corpus renders; data textures are chunked and tested with a 16k `MAX_TEXTURE_SIZE`
- [x] Visibility is a contiguous range plus role/travel/tool filters in the shader
- [x] Resources free on dispose (test)

## Tasks

- [x] Port segment geometry
- [x] Data-texture chunking
- [x] Visibility range and filters
- [x] Dispose

## Progress

Done (worker gcp31-worker). Wires webview-kit's SP4 renderer (PLT-42/44, `@vsslicer/webview-kit/gl` 0.5.0) into gcode-preview's webview; libvgcode is not re-ported.

Design choices:
- **One contiguous buffer.** The webview concatenates the per-chunk move buffers once (`concatMoves`) and drops the originals; a single buffer is used without copying. Cost: one transient copy, the moves held twice while copying (about 420 MB at 15M moves). Per-chunk upload would need one renderer per buffer, global-to-local range offsets and the segment that crosses a buffer boundary, so it is more code for the same result. Marked `shortcut:` in the code.
- Transport, 28-byte record, no workers, no WebGPU: unchanged.
- **Visibility in webview state.** `SavedView` (setState) is `{ layer, roleMask?, hiddenFlags? }`; the range is moves 0 to the end of `layer` (`visibleRange`), `hiddenFlags` defaults to `MoveFlag.Travel`, `roleMask` to all. GCP-35 sliders and later cards set state and redraw.
- **Camera.** Fixed front-above view fitting the bounding sphere of the extruding moves (`printBounds`, `frameCamera`); orbit/pan/zoom is GCP-33. Colour mode fixed to Feature (GCP-32).
- Context loss through the kit's `trackContextLoss` (rebuild and redraw on restore). The renderer is disposed on every new state message.
- Renderer wiring is its own file, `src/presentation/webview/preview-renderer.ts`; `main.ts` only mounts it.

Verified (in `vsslicer/modules/gcode-preview`):
- `pnpm install` (lockfile unchanged), `pnpm lint`, `pnpm test` (33 pass, 10 new in `test/renderer.test.ts`), `pnpm build`: lint + test + build took 6 s.
- `pnpm test:integration`: 9 passing on VS Code 1.100.0 and 1.143.1, 19 s.
- The module has no Playwright harness, so `test/renderer.test.ts` runs against a recording fake WebGL2 context: for each of the five corpus files with `maxTextureSize` 64 (several textures each), every texture is created, each chunk is drawn once, the instances add up to `moveCount - 1`, and dispose deletes every texture, the program, the VAO and the index buffer. Separate tests cover the range and masks reaching the uniforms, travels hidden by default, context-loss rebuild, concat order and the camera.
- 16k `MAX_TEXTURE_SIZE` chunking: covered by webview-kit's tests (`test/move-textures.test.ts`, `test/move-textures.spec.ts`, `test/segment-renderer.spec.ts`), not duplicated here.
- `dist/webview.js` is 40 KB and bundles the kit's `gl` files (`dist/webview.meta.json`); the libvgcode attribution is a `/*! */` comment that esbuild keeps at the end of the bundle.

Not done / not checked: no pixel check in a real VS Code webview (the integration suite does not look at the canvas), and no check at 15M moves.

CHANGELOG (coordinator):
- Added: the preview draws the moves with webview-kit's instanced segment renderer (libvgcode port, AGPL-3.0): moves up to the saved layer, role and flag masks in the webview state (travels hidden by default), a camera that frames the print, GPU resources freed on dispose and rebuilt after a context loss.

Files: `vsslicer/modules/gcode-preview/src/presentation/webview/preview-renderer.ts` (new), `src/presentation/webview/main.ts`, `test/renderer.test.ts` (new), `PROVENANCE.md`.

Review (gcp31-review): PASS. Ran `pnpm install` (lockfile unchanged), `pnpm lint`, `pnpm test` (33 pass), `pnpm build` (dist/webview.js 37 KB, 25 kit `gl` inputs in the meta), `pnpm test:integration` (9 passing on each of the two VS Code versions). Checked against webview-kit 0.5.0 `dist/gl`: parser chunks do not overlap (chunk-writer starts the next chunk at the following move), so the join is a plain concatenation; a probe in scratch parsed cube-marlin with `chunkMoves: 97` (more than 5 buffers), got bytes identical to a single-buffer parse and the same layer `firstMove`s, and drew `layers[4].firstMove - 1` instances for layer 3 at `maxTextureSize` 64, so the move crossing a buffer boundary is drawn and the instance count is right; a double dispose is safe. Dispose frees the chunk textures, the layer and palette textures, the program, the VAO and the index buffer, and removes the context-loss listeners. `buffers = []` after the join, and the old renderer is dropped on each state message. On context loss the renderer is dropped without freeing (its objects are gone with the context), then rebuilt and redrawn on restore. roleMask, hiddenFlags (travels hidden by default) and the range reach `uRoleMask`, `uHiddenFlags` and the instance ranges. The `/*! */` libvgcode attribution is in dist/webview.js (line 1024). No `vscode` import outside presentation. Notes, none blocking: THIRD-PARTY-NOTICES.md says "No third-party packages are bundled" because @vsslicer packages count as first-party, so the AGPL attribution relies on the legal comment and PROVENANCE.md. Not checked: pixels in a real webview, and 15M-move memory.
