---
id: 38
title: "Add the timeline, toolhead marker and extruded path"
type: feature
priority: P0
effort: L
model: sonnet
area: [simulation]
story: US12
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [37, 35]
created: 2026-10-25
---

Play, pause, speed multiplier and step over E4's start times.

## Acceptance criteria

- [x] Timeline plays the corpus; pause, step and speed multiplier work (integration test)
- [x] Toolhead marker follows `interp`; extruded path drawn up to it
- [x] Scrub updates only the visibility range

## Tasks

- [x] Timeline control
- [x] Marker rendering
- [x] Path-to-time visibility
- [x] Test

## Progress

Done. Module vsslicer/modules/gcode-preview.

Design decision: interpolation runs in the webview, from the move buffer it already holds. Each 28-byte move record carries the planner's f32 start time (MoveOffset.startTime), so no `parsed`/`timing` and no new host data are needed; the webview binary-searches the start times and interpolates at constant speed from the previous move's end point to this move's over [start, next start] (the same model as the planner's `ToolheadWindow` fallback; Klipper trapezoid profiles and G4 dwells are not shaped, a dwell shows as slow motion; marked `shortcut:` in timeline.ts). Extra memory per move: 0 bytes (reads the buffer in place; no table). Worker answering ToolheadWindow on demand was rejected: round trips per frame for a visual-only gain. Transport unchanged, no webview workers; two new notifications on the existing channel: `gcode-preview/progress` (webview to host) and `gcode-preview/command` (host to webview, drives the timeline in tests).

Done: `timeline.ts` (clock with play/pause/speed/seek/tick, moveAtTime, stepTime, positionAt, layerOfMove, project); main.ts timeline row (Play/Pause, Step back, Step, speed 0.5x..2000x, time slider), marker (DOM dot over the canvas, projected with the camera matrices), and the clock sets layer + move count of the existing visibility range each tick (no re-upload). Provider/session: `command`, `onProgress`, probe `command()`/`progress()`.

Verified in the module: pnpm lint OK; pnpm test 52/52 (new test/timeline.test.ts: clock, interpolation, step, layerOfMove, project, and playing the orca corpus with draws and spyGlUploads showing zero uploads after the first); pnpm build OK; pnpm test:integration 10/10 on VS Code 1.100.0 and stable (new test: speed 500x, play, pause stands still, step forward/back, play to the end, marker ends on the last move).

Not done: trapezoid-shaped marker motion (needs host-side ToolheadWindow); marker is a DOM dot, no depth occlusion.

CHANGELOG (gcode-preview): - Added: timeline with play, pause, step and speed multiplier over the print's start times, a toolhead marker following the interpolated position, and the extruded path drawn up to it (scrubbing changes only the visibility range).
package.json: no changes needed.

Fix round (gcp38-fix): (1) main.ts done() now calls apply(false): it places the marker at time 0 and redraws but no longer patches layer/move from the clock, so a load keeps the saved view, or GCP-35's whole print (layer = last). Only playing, stepping and scrubbing set the range. (2) The play loop now runs on requestAnimationFrame (no setInterval; dt clamped at 0), and a document visibilitychange to hidden pauses playback, so a retained hidden preview stops redrawing. Fixed the "32-byte" typo (28 bytes). Verified: pnpm lint OK, pnpm test 52/52, pnpm build OK, pnpm test:integration 10/10. Not done: no new automated test for either fix: both live in main.ts, which is DOM-bound and has no unit seam, and the host cannot observe the visible range or document visibility (Progress carries only time/move); a probe field would touch domain/summary.ts, outside this round's scope. Changed file: vsslicer/modules/gcode-preview/src/presentation/webview/main.ts. CHANGELOG unchanged from above.

Review (gcp38-rereview): PASS, checked the fix round. (1) main.ts done() -> apply(false) leaves layer/move/bottom alone and only places the marker and calls redraw(), which draws the saved state, or layer = last that done() sets just before. patch() runs only in seekTo, setPlaying and the rAF step, so a load no longer resets to layer 0. (2) The play loop uses requestAnimationFrame with dt clamped at 0. render() and setPlaying cancel the frame, and visibilitychange to hidden calls setPlaying(false). A scratch probe of the real createClock with a fake rAF and document confirmed that playback advances at 1x and that once hidden the clock pauses, nothing is queued and nothing is applied. Missing test for finding 1: accepted. The change is one argument on an evidently correct branch, main.ts has no DOM seam, and the host cannot observe the visible range. Suggest a follow-up seam if main.ts grows. Re-ran pnpm install (lockfile unchanged), lint OK, test 52/52, build OK, test:integration 10/10 on both VS Code versions. Scope as in the first review (constant-speed interpolation accepted, GCP-97 covers trapezoids).
