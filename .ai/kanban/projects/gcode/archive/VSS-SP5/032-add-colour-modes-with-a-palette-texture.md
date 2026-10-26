---
id: 32
title: Add colour modes with a palette texture
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

Mode switch is a uniform change. Modes in this card: feature, speed, layer time, tool. Width, flow, fan and temperature moved to GCP-96 (SP6) in SP5: webview-kit 0.5's shader has only these four modes and the 28-byte record has no fan or temperature.

## Acceptance criteria

- [ ] Each of the four modes renders the corpus; switching modes does not re-upload geometry (upload counter test)
- [ ] Per-move scalars (speed, layer time, tool) come from the buffers and Timing

## Tasks

- [ ] Per-move scalar attributes (width, flow, fan, temperature: GCP-96)
- [x] Palette texture
- [x] Shader switch
- [x] Legend data

## Progress

PARTIAL. Four of the eight modes work: feature, speed, tool, layer time (webview-kit 0.5.0 `ColorMode`: Feature, Speed, Tool, LayerTime). Width, flow, fan and temperature are NOT done, so the two acceptance criteria and "Per-move scalar attributes" stay unticked.

Why: the kit shader colours only by those four. Width is in the 28-byte record (f16) but the shader has no width mode; flow would be width x height x speed (all in the record, again no shader mode); fan and temperature are not in the record at all (D17), so they need new per-move data. Computing them in gcode-preview would mean a second buffer or a changed record, i.e. a geometry re-upload or a transport change (D17/D18), which the card forbids. Kit change needed (webview-kit, a minor): `ColorMode.Width` and `ColorMode.Flow` computed in the shader from the existing record, and for fan/temperature either a per-move scalar texture (R32F, one texel per move, uploaded once) plus `ColorMode.Scalar` with `colorRange`, with the parser/planner filling it (record or side buffer: a D17/D18 decision).

Done: `Visibility.colorMode` (default Feature) passed to the kit `draw`; mode lives in the webview state (`SavedView.colorMode`, survives hide/show) with a select in a toolbar; `legend.ts` (`COLOR_MODES`, `legendFor`: categories for feature/tool, gradient with unit and the kit's data range for speed/layer time; the range is shown as text next to the select, swatches are the kit palette's and not drawn). `PreviewRenderer` now exposes `bounds` and `ranges()`.
Verified: `cd vsslicer/modules/gcode-preview`; `pnpm test` 42 pass, 0 fail (new: mode switch on the orca corpus file with `spyGlUploads` and a 64-texel limit: all four modes draw, `uMode` set each time, upload counts and createTexture/createBuffer counts unchanged after the first draw; legend data). `pnpm build` ok; `eslint .`, `tsc`, `prettier --check src test` ok. `pnpm lint` itself fails only on `prettier --check CHANGELOG.md`, a file I did not touch (git status clean for it).
CHANGELOG: - Added: colour modes feature, speed, tool and layer time in the preview, switched with a uniform (no re-upload), with legend data and the choice kept in the webview state. (Width, flow, fan, temperature pending a webview-kit change.)
Files: src/presentation/webview/legend.ts (new), src/presentation/webview/preview-renderer.ts, src/presentation/webview/main.ts, test/renderer.test.ts. No visual check in a real WebGL context was done (fake-GL tests only).

Review (gcp3233-review): PASS, re-ran pnpm lint/test (42 pass)/build/test:integration (9 pass); four modes (re-scoped, rest in GCP-96) go through the uMode uniform only; the test compares spyGlUploads counts and createTexture/createBuffer counts after the first draw; legend.ts is pure. Note: a hidden webview with clientWidth 0 gives aspect 0, so a preset button press could save dist=Infinity (null after JSON); low risk, not blocking.
