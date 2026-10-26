---
id: 108
title: Give ToolheadWindow a public transfer form and a planner-free sampler entry
type: chore
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP6"
created: 2026-10-26
---

Follow-up from GCP-97's review (SP6): gcode-preview rebuilds `ToolheadWindow` by reading its private `data` field and `Object.create(ToolheadWindow.prototype)` (marked `shortcut:` in `gcode-preview/src/domain/window.ts`). A planner refactor would break it silently.

**Code:** `vsslicer/modules/gcode-planner/src/domain/interp.ts` (module: `gcode-planner`, layer: domain)

## Acceptance criteria

- [x] `ToolheadWindow` has a public, documented `toTransfer()` (plain typed arrays and numbers) and a static `fromTransfer()` that round-trips exactly (test)
- [x] The window sampler (`positionAt`) can be imported without the Klipper planner (a subpath export or a separate entry), so the webview bundle does not carry it

## Tasks

- [x] Export and import
- [x] Subpath entry
- [x] Tests

## Progress

Done. `ToolheadWindow.toTransfer()` returns `WindowTransfer` (start, end, startTime, endTime, profiled, data Float64Array; shares data, no copy); static `fromTransfer()` rebuilds it without a planner and throws RangeError on a malformed one. Subpath export `@vsslicer/gcode-planner/window` (`src/window.ts`, package.json "exports") re-exports ToolheadWindow and types; its value-import graph is interp, trapezoids, timing, gcode-api: no Klipper/Marlin/RRF modules. `WindowTransfer` also exported from the main entry.
Verified: pnpm lint, build, test (96 pass). New tests in test/interp.test.ts: exact round-trip (structuredClone, equal positionAt, malformed throws) and a static value-import walk from src/window.ts asserting klipper/marlin/rrf-planner/planner are absent. No dependency or lockfile change.
Not done: gcode-preview not touched (switches later). Subpath is not bundled-checked with esbuild.
Files: vsslicer/modules/gcode-planner/src/domain/interp.ts, src/window.ts, src/index.ts, package.json, test/interp.test.ts.
Changelog: Added `ToolheadWindow.toTransfer()` / `fromTransfer()` and the `@vsslicer/gcode-planner/window` subpath (sampler without the planners).
- Review passed (gcp96-108-reviewer): lint/build/test pass. Probes: fromTransfer throws RangeError on short data, empty and negative ranges; round trip test exact (structuredClone, equal positionAt). esbuild bundle of dist/window.js is 13.9 kB with 0 hits for klipper/marlin/rrf/planSync (main entry bundle 65 kB, 16 klipper hits). exports map keeps "." and adds "./window"; gcode-preview imports only the main entry and builds. Not verified: toTransfer shares data, no copy (documented).
