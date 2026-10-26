---
id: 33
title: "Add orbit, pan, zoom and top/iso/front views"
type: feature
priority: P0
effort: M
model: sonnet
area: [renderer]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [31]
created: 2026-10-25
---

Navigation of the print.

## Acceptance criteria

- [ ] Orbit, pan, zoom work; top/iso/front buttons set the camera (unit test of camera maths)
- [ ] Camera survives hide and show via `setState`

## Tasks

- [x] Camera controller
- [x] View presets
- [x] State persistence

## Progress

Done. `src/presentation/webview/camera.ts` is pure (no DOM/GL): `CameraState` (target, yaw, pitch, dist, radius, plain numbers), `presetCamera(bounds, aspect, 'top'|'iso'|'front')`, `orbit`, `pan` (pixel drag at target depth), `zoom` (clamped 5%..20x radius), `cameraMatrices`. `frameCamera` in preview-renderer.ts is now a thin wrapper (default iso). Wiring in main.ts: left drag orbits, right or shift drag pans, wheel zooms, top/iso/front buttons set presets; every change goes to `setState` (`SavedView.camera`), and `redraw` reads it, so it survives hide/show and reload. Pitch is clamped 0.01 rad short of the poles.
Verified: `pnpm test` 42 pass, 0 fail (test/camera.test.ts: presets centre the print on the axis, top looks down with +Y up, front looks along +Y, iso from front-right above, orbit clamp, pan distance and direction, zoom limits; renderer.test.ts: a saved camera changes the drawn view matrix). `pnpm build`, `eslint .`, `tsc`, `prettier --check src test` ok; `pnpm lint` fails only on `prettier --check CHANGELOG.md`, untouched by me.
Not checked: pointer/wheel handlers in a real browser (no DOM test harness here); a camera saved for one file is also reused if the same webview later loads another file.
CHANGELOG: - Added: orbit (drag), pan (right or shift drag) and zoom (wheel) in the preview, top/iso/front view buttons, and the camera kept across hide and show.
Files: src/presentation/webview/camera.ts (new), src/presentation/webview/preview-renderer.ts, src/presentation/webview/main.ts, test/camera.test.ts (new), test/renderer.test.ts.

Review (gcp3233-review): PASS, re-ran lint/test/build/test:integration (all green). camera.ts is pure (no DOM/GL/VS Code); pitch clamped 0.01 rad short of poles, zoom clamped 0.05..20 x radius, radius floored at 1 so zero-size bounds give no NaN; camera and colourMode are in SavedView and read by redraw. Notes (not blocking): aspect 0 (hidden canvas) gives Infinity dist in presetCamera; stale camera reused across files (already stated); pointer handlers untested in a browser.
