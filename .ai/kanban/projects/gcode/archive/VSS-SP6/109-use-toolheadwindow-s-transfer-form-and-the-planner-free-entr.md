---
id: 109
title: "Use ToolheadWindow's transfer form and the planner-free entry in the preview"
type: chore
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP6"
depends_on: [108]
created: 2026-10-26
---

Follow-up from GCP-97 and GCP-108 (SP6): gcode-preview's `src/domain/window.ts` reads `ToolheadWindow`'s private `data` and rebuilds it with `Object.create` (a `shortcut:`), and the webview bundle carries about 50 KB of gcode-planner for `positionAt`. gcode-planner 0.5.0 has `toTransfer()`, `fromTransfer()` and the `@vsslicer/gcode-planner/window` entry.

**Code:** `vsslicer/modules/gcode-preview/src/domain/window.ts`, `src/presentation/webview/timeline.ts` (module: `gcode-preview`)

## Acceptance criteria

- [x] window.ts uses `toTransfer`/`fromTransfer`; the shortcut comment and the private-field read are gone
- [x] The webview imports the sampler from `@vsslicer/gcode-planner/window`; the bundle has no Klipper planner (grep test or size check)
- [x] The marker tests (within 0.01 mm, G4 hold, no re-upload) still pass

## Tasks

- [x] Raise gcode-planner to ^0.5.0
- [x] Switch window.ts and the webview import
- [x] Bundle check

## Progress

Done. gcode-planner raised to ^0.5.0 (package.json, pnpm-lock.yaml; no new dependency). `src/domain/window.ts` now uses `toTransfer()`/`ToolheadWindow.fromTransfer()` from `@vsslicer/gcode-planner/window`; shortcut comment, private `data` read and `Object.create` are gone. `timeline.ts` type import also from `/window`. Wire format unchanged.

Bundle: dist/webview.js 112 KB before, 75 KB after (-37 KB). New `test/bundle.test.ts` builds the webview with esbuild (metafile) and asserts the sampler (interp.js) is bundled and none of klipper/marlin/bambu/rrf-planner/planner/arc/move-cursor from gcode-planner is. timing.js and trapezoids.js remain (the sampler needs them).

Verified: pnpm lint, build, test all pass (68 tests, marker tests included). Not run: test:integration.

Files: package.json, pnpm-lock.yaml, src/domain/window.ts, src/presentation/webview/timeline.ts, test/bundle.test.ts.

Changelog: Use gcode-planner 0.5.0's `toTransfer`/`fromTransfer` and `/window` entry; the webview bundle drops the planners (112 KB to 75 KB).

Review passed (prf13-gcp109-reviewer): install/lint/build/test green (68 tests), dist/webview.js 75K; shortcut and private-data read gone; planner ^0.5.0 in package.json and lock. Probe: bundling the webview plus a main-entry import gives 7 planner files and 126 KB, so bundle.test.ts would catch a regression; clean build 0 planner files.
