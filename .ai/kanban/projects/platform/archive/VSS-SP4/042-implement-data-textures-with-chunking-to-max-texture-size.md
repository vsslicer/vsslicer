---
id: 42
title: Implement data textures with chunking to MAX_TEXTURE_SIZE
type: feature
priority: P0
effort: L
model: opus
area: [webview-kit]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-42-worker
depends_on: [41]
created: 2026-10-25
---

Per-move attributes in 2D data textures chunked to `MAX_TEXTURE_SIZE`, following the 28-byte-per-move layout (D6; GCP owns the typed arrays, E19).

## Acceptance criteria

- [x] Move count above `MAX_TEXTURE_SIZE²` renders identically to a reference made with an artificially small limit
- [x] Layout documented per attribute (position f32×3, width and height f16, role/tool/flags u8, file offset u32, start time f32)
- [x] Uploads happen once per chunk, never on view changes

## Tasks

- [x] Define the layout against `gcode-viewer-simulation.md` §6
- [x] Implement chunked upload
- [x] Write the small-limit reference test

## Progress

Done (webview-kit, `gl` entry, unreleased under `## Unreleased`).

- Layout: the gcode-api 28-byte record (D17) is uploaded unchanged as `R32UI`, 7 texels per move, so the GPU holds 28 B/move with no CPU repack. Per-attribute table in `src/gl/move-textures.ts` and the README ("Move data textures"); `MOVE_TEXTURE_GLSL` gives the shader accessors (`movePosition`, `moveWidthHeight`, `moveRoleToolFlags`, `moveFileOffset`, `moveStartTime`) for PLT-44.
- Chunking: `planMoveChunks` puts at most `MAX_TEXTURE_SIZE²/7` records in a texture (side capped at 32768 so the GLSL int index fits). Consecutive chunks share one record because a move runs from record r-1 to r, and each chunk draws its segments from local record 1. `uploadMoveTextures` makes one texStorage2D and at most two texSubImage2D calls per chunk (full rows, then the partial last row), and nothing after that.
- Verified: `pnpm install && pnpm lint && pnpm test && pnpm build` pass (106 vitest tests). `pnpm exec playwright test test/move-textures.spec.ts test/gl.spec.ts` passes 3/3 on SwiftShader. Checks: the shader decodes every field of 1000 records, with the real limit and with limit 8; 1000 moves (above 8² = 64) at limit 8 (125 textures) render pixel-identical to one texture; the upload count stays the same over two later draws with a different view offset. Mutation check: dropping the one-record overlap fails the render comparison, and swapping the tool/flags bytes fails the decode check. test-results/ deleted.
- Not done / known: callers pass one concatenated move buffer (several GCP chunk buffers are not accepted). The upload leaves its texture bound and sets the unpack state, so when the context is shared with three.js the caller resets three.js state afterwards (PLT-44 / three.js card). The full `pnpm test:browser` run has 1 failure in `test/webview-stub.spec.ts`, which belongs to another in-flight card and is not this card's file.
- Files: `vsslicer/modules/webview-kit/src/gl/move-textures.ts` (new), `src/gl/index.ts` (exports), `test/move-textures.test.ts`, `test/move-textures.spec.ts`, `test/move-textures.page.ts` (new), `README.md` (section), `CHANGELOG.md` (Unreleased entry). Notes: `.reference/notes/PLT-42-data-textures.md`.
