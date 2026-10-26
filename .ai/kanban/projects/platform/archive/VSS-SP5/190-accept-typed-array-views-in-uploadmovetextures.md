---
id: 190
title: Accept typed-array views in uploadMoveTextures
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: webview-kit (gl). Finding 8 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] uploadMoveTextures uploads a Uint8Array view with a non-zero byteOffset correctly, or rejects it with a clear error (test)

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Rejects (does not accept) a typed-array view: `uploadMoveTextures` and `createSegmentRenderer` throw TypeError unless `moves instanceof ArrayBuffer`. Test: `test/move-textures.test.ts` (view refused), `test/segment-renderer.test.ts` (view refused).
Verified in vsslicer/modules/webview-kit: pnpm lint, test (120 passed), build all pass.
CHANGELOG: - Fixed: uploadMoveTextures and createSegmentRenderer throw a TypeError for a typed-array view instead of uploading scrambled data.
Files: src/gl/move-textures.ts, src/gl/segment-renderer.ts, test/move-textures.test.ts, test/segment-renderer.test.ts.

Review (plt190-review): PASS, criterion allows rejecting with a clear error; TypeError at move-textures.ts:63 and segment-renderer.ts:160 with tests. Only external caller gcode-preview preview-renderer.ts passes an ArrayBuffer (concatMoves returns buffers[0] as the ArrayBuffer for a single chunk, or out.buffer), so no break. pnpm lint, test (121), build pass; Playwright segment-renderer, move-textures, memory, gl-upload-spy, three-foreign: 11 passed. Note: instanceof ArrayBuffer fails for cross-realm buffers; not an issue in current callers.
