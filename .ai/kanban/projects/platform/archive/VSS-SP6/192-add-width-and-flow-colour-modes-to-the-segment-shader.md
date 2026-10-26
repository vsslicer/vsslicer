---
id: 192
title: Add Width and Flow colour modes to the segment shader
type: feature
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP6"
created: 2026-10-26
---

Split from GCP-96 at SP6 start: the webview-kit part of the width and flow colour modes, so the preview part can follow the kit's release (rule 13).

**Code:** `vsslicer/modules/webview-kit/` (module: `webview-kit`, layer: presentation/gl)

## Acceptance criteria

- [x] The segment shader gains `ColorMode.Width` (width from the 28-byte record's f16) and `ColorMode.Flow` (width x height x speed), with a range uniform for the legend
- [x] Switching mode re-uploads no geometry (spyGlUploads test)
- [x] Existing modes render as before (tests)

## Tasks

- [x] Shader and ColorMode
- [x] Tests

## Progress

Done. `ColorMode.Width` (4) and `ColorMode.Flow` (5) added in `segment-shader.ts` (uMode 4/5, same gradient and palette row as speed; travel or size-less moves get the dummy grey) and `segment-renderer.ts`. `SegmentRenderer.ranges` now also has `width` (mm) and `flow` (width x height x speed, mm3/s), min/max over non-travel moves, `[0, 0]` when unknown; they are the default `colorRange` of each mode, so the preview reads them for the legend. New exported `halfToNumber` decodes the f16 width/height in `analyseMoves`.
Verified: `pnpm lint && pnpm build && pnpm test` pass (123 tests, new: halfToNumber, width/flow ranges). Playwright (`pnpm test:browser`) ran: gl-upload-spy now cycles Width and Flow (zero uploads after create), the many-textures spec covers both, new width/flow colour spec; existing mode specs unchanged.
Files: webview-kit `src/gl/segment-shader.ts`, `src/gl/segment-renderer.ts`, `test/segment-renderer.test.ts`, `test/segment-renderer.spec.ts`, `test/gl-upload-spy.page.ts`. Did not touch context.ts. No lockfile change.

Changelog: Added `ColorMode.Width` and `ColorMode.Flow` to the segment renderer; `ranges` gains `width` and `flow` (also the default colour range of those modes).

Review passed (plt192-reviewer): lint, build, vitest (123) and Playwright segment-renderer.spec + gl-upload-spy pass; halfToNumber matches an IEEE f16 reference over all 65536 patterns (subnormals, inf/NaN, sign); flow = len/dt * w * h, travel and size-less moves excluded (dummy grey in shader, skipped in ranges); gcode-preview legendFor/ranges still type-check; no uploads on mode switch.
