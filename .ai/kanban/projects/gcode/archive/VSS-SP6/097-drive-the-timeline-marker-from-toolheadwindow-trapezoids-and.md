---
id: 97
title: Drive the timeline marker from ToolheadWindow trapezoids and dwells
type: feature
priority: P2
effort: M
model: sonnet
area: [renderer]
story: US12
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [38]
created: 2026-10-26
---

Follow-up from GCP-38 (SP5): the timeline's toolhead marker moves at constant speed between move start times (the `ToolheadWindow` fallback), computed in the webview from the move records. Klipper files should follow their `trapezoidsFor` trapezoids and hold through G4 dwells, as `ToolheadWindow` in gcode-planner 0.4.0 does.

## Acceptance criteria

- [x] For Klipper files the marker position comes from `ToolheadWindow` trapezoids (window per visible span, from the worker or by sending trapezoids with the moves), within 0.01 mm of the planner in a test
- [x] G4 dwells hold the marker still instead of slow motion
- [x] No geometry re-upload while playing (spyGlUploads)

## Tasks

- [x] Choose where windows are built (worker on demand or sent with the moves) and its memory per move
- [x] Wire it into `timeline.ts`

## Progress

Done. Windows are built in the host on demand (D18/D19 untouched: no change to how data is sent or workers start).
- Host (`preview-session.ts`) now keeps the parse (parsed + timing) instead of only the move buffers (adds the extrusion buffers and markers to host memory, ~4 B/move + markers). On a `Method.window` request `{seq, from, to}` it builds `new ToolheadWindow(plannerFor(parsed, timing.limits), ...)` and answers with `sendBuffer` on stream `<session>/window/<seq>` (the existing channel, no new transport).
- Cost per move: 17 doubles = 136 B on the wire (+40 B header per window). Window = 2048 moves = 278 KB, one request in flight, next window prefetched at 3/4 through. A 1M-move print has ~490 windows, only those played or scrubbed to are ever sent. Host time per window: the Klipper replay from the nearest checkpoint (about 4 ms measured by eye on test data; unmeasured on a large file).
- Webview (`timeline.ts` `createMarker`) samples the window covering the clock time; while none covers it (first frame, after a seek until the reply) it falls back to the old constant-speed `positionAt`. When a reply lands while paused the marker is redrawn (`apply(false)`, redraw only).
- Windows are used for every flavour (non-Klipper windows carry the planner's own fallback incl. G4 holds), not only Klipper.
- `domain/window.ts` packs/unpacks a window as one Float64Array. It reads ToolheadWindow's private `data` and rebuilds the instance with `Object.create(ToolheadWindow.prototype)`: fragile against planner changes. Suggested planner follow-up: a public `ToolheadWindow.export()/import()`; then delete the cast (marked `shortcut:` in the file).
- Verified: `pnpm lint && pnpm build && pnpm test` pass (67 tests). New `test/marker.test.ts`: full session round trip (structuredClone of the load as the worker does), marker within 0.01 mm of a planner window over 400 forward samples plus seeks across 64-move windows; G4 holds still (and fallback is shown to crawl); Marlin windows; no GL uploads while playing with the marker.
- Not verified: the real webview in VS Code (integration test not run), memory/time on a multi-100k-move file. main.ts touched minimally (imports, window state, apply(), onBuffer branch, request poster in `done`).
- Files: src/domain/window.ts (new), src/domain/summary.ts, src/application/preview-session.ts, src/presentation/webview/timeline.ts, src/presentation/webview/main.ts, test/marker.test.ts (new).
- Review passed (gcp97-reviewer): pnpm install/lint/build/test pass (67 tests) with GCP-40's retry diff in the same files; the two coexist (shared `current` session in serve, provider keeps the session for its live `state` getter). Probes (scratch, 1M-move Klipper file): window build 2.5-5.3 ms at start/middle/end, pack/unpack round trip identical. Host memory correction: besides extrusion (4 B/move) the host now also keeps checkpoints (~3.4 KB each, ~0.84 B/move), markers, layers, stateChanges, diagnostics, thumbnails, config; at 10M moves that is about +50 MB on top of the 280 MB of move buffers it already held (~+18%), acceptable. Race probe (20k frames, 2% random seeks, replies delayed and reordered): 0 samples off the planner by >0.01 mm, since `sample` only reads a window that covers t; a stale reply costs at most one extra round trip. File reload: provider has no file watch, a reopened file is a new webview session id, so stale window streams are filtered by `windowSeq`. Windows for every flavour: fine (planner fallback incl. G4 holds, tested for Marlin). D18 (host-built buffers via sendBuffer) followed, D19 untouched (no worker change). Shortcut on private `data` / `Object.create` is marked `shortcut:` in window.ts. Follow-ups to card: (1) gcode-planner public `ToolheadWindow` export/import (needed: the private field and constructor bypass break silently on a planner refactor); (2) the webview bundle now carries ~50 KB of gcode-planner (Klipper planner etc.) only for `positionAt`; a planner subpath export of the window sampler would drop it.

Changelog: Timeline marker follows the planner's acceleration trapezoids and holds still through G4 dwells (windows built in the host on demand).
