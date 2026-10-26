---
id: 96
title: "Add width, flow, fan and temperature colour modes"
type: feature
priority: P1
effort: M
model: sonnet
area: [renderer]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [PLT-192]
created: 2026-10-26
---

Split from GCP-32 in SP5: the colour modes that webview-kit 0.5's segment shader cannot draw yet.

## Acceptance criteria

- [x] Width and flow modes: webview-kit's shader gains `ColorMode.Width` and `ColorMode.Flow` (width is in the 28-byte record as f16; flow from width x height x speed), released once, and the preview offers them
- [ ] Fan and temperature modes: per-move fan and temperature come from the parser's state changes into a per-move scalar texture (or a record change), chosen after D17 (move layout) is decided
- [x] Switching to width and flow does not re-upload geometry (spyGlUploads test); fan and temperature: GCP-107

## Tasks

- [x] webview-kit: Width and Flow shader modes (PLT card, platform board)
- [ ] Decide the per-move scalar path for fan and temperature once D17 is accepted
- [ ] gcode-preview: offer the four modes and their legends

## Progress

- Created in SP5 from GCP-32's review: GCP-32 ships feature, speed, tool and layer time (`gcp3233-worker`); webview-kit 0.5.0 has only those four `ColorMode`s and the 28-byte record has no fan or temperature.
- SP6 (gcp96-worker), scoped to width and flow; fan and temperature moved to GCP-107, shader part was PLT-192. Raised `@vsslicer/webview-kit` to ^0.6.0 (package.json, pnpm-lock.yaml; no new dependency). `COLOR_MODES` now offers Width (mm) and Flow (mm³/s) in the control and legend; `legendFor` takes `ranges.width`/`ranges.flow`. No change to controls.ts: a mode change only sets `colorMode` in the saved view.
- Verified: `pnpm install && lint && build && test` pass (67 tests). Existing "every colour mode draws the corpus" test iterates COLOR_MODES, so it now covers both new modes with spyGlUploads (no upload, no new GPU object); legend test extended with width and flow ranges.
- Not done: fan and temperature modes (GCP-107); criterion 3 stays open for them. gcode-planner untouched.
- Changelog: Added: Width and Flow colour modes with legends (webview-kit ^0.6.0).
- Files: vsslicer/modules/gcode-preview/{package.json,pnpm-lock.yaml,src/presentation/webview/legend.ts,test/renderer.test.ts}
- Review passed (gcp96-108-reviewer): install/lint/build/test pass (67 tests). Probe (copy in scratch) shows the COLOR_MODES loop draws modes 0-5 incl. Width=4, Flow=5 under spyGlUploads with no upload and no new GPU object. Legend units mm and mm³/s, ranges come from webview-kit 0.6.0 SegmentRenderer.ranges (main.ts:210). Criterion 3 holds for width/flow; fan/temperature is GCP-107. package.json and lock both at webview-kit 0.6.0.
