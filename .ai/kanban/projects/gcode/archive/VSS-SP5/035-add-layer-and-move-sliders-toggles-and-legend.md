---
id: 35
title: "Add layer and move sliders, toggles and legend"
type: feature
priority: P0
effort: M
model: sonnet
area: [renderer]
story: US11
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [32]
created: 2026-10-25
---

Controls over the visibility range.

## Acceptance criteria

- [x] Layer range slider, move slider within a layer, feature and travel toggles and a legend work on the corpus
- [x] Scrubbing the move slider causes no geometry re-upload (counted)
- [x] Per-layer time from E4 is shown

## Tasks

- [x] Slider components
- [x] Range uniform wiring
- [x] Legend
- [x] Upload counter test

## Progress

Done. Webview controls in `main.ts`: top and bottom layer sliders (layer range), move slider within the top layer, one checkbox per role present in the file plus a Travel moves checkbox, per-layer time (top layer and selected range, from `summary.layerTimes` which the host already sends, so no host change), legend. All plain HTML with VS Code CSS variables and aria labels; state (`layer`, `bottom`, `move`, `roleMask`, `hiddenFlags`) is in the webview state. Renderer: `Visibility` gained `bottom` and `move`; `visibleRange` uses them (first/count uniforms only).

Verified in gcode-preview: `pnpm lint` ok, `pnpm test` 46/46, `pnpm build` ok, `pnpm test:integration` 9 passing. New tests: visibleRange bottom/move/clamp, roleName/presentRoles on the corpus, and scrubbing (move, bottom, masks) with `spyGlUploads` showing zero uploads and zero new GPU objects.

Not done / limits: the legend colours are not shown for feature/tool (the kit does not export ROLE_COLORS/TOOL_COLORS from `@vsslicer/webview-kit/gl`; kit change needed, add export); the gradient bar is a CSS blue-to-red approximation of the kit's 11-stop palette. Not exercised in a real webview by a test (only the pure and renderer parts are), only built.

CHANGELOG: - Added: layer range and move sliders, feature and travel toggles, per-layer time and a gradient legend in the preview.

Files: src/presentation/webview/main.ts, preview-renderer.ts, controls.ts (new), test/renderer.test.ts.

Review (gcode35-review): PASS, lint/test 46/46/build/test:integration 9 passing re-run. Instance counts are correct: the kit draws moves `first..first+count-1` (move i is segment i-1 to i, move 0 never drawn), so first = firstMove(bottom) includes the bottom layer's first move, end = firstMove(layer+1) exclusive includes the top layer's last move, move slider N draws N moves of the top layer (clamped, max = undefined); the existing -1 assertions (full file, layer 0) hold unchanged and the new probe shows narrower draws; scrubbing counted 0 uploads and 0 new textures/buffers; sliders/checkboxes have aria labels and aria-valuetext; state saved via setState; controls.ts is pure, VS Code API-free. Nits (not blocking): fieldset has no legend; saved bottom/move from another file are not clamped (layer has the same pre-existing behaviour).
