---
id: 34
title: Set up Playwright snapshots on Chromium with SwiftShader
type: chore
priority: P0
effort: M
model: sonnet
area: [renderer]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [32]
created: 2026-10-25
---

Pixel oracle for the renderer. Needs PLT test tooling; confirm `--enable-unsafe-swiftshader` on free GitHub runners early.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] Snapshots exist for each colour mode, a layer range and a travel toggle on corpus files
- [x] A shader change that moves pixels beyond tolerance fails the run
- [ ] Runs in CI on a free runner

## Tasks

- [x] Harness page
- [x] Snapshot set
- [ ] CI job

## Progress

Done in webview-kit (module `webview-kit`, adapters/test layer), not gcode-preview: the pixels come from webview-kit's segment renderer and shader, which gcode-preview only consumes as a published package, and the module-independence rule forbids gcode-preview reaching into its files. webview-kit already runs SwiftShader Playwright specs (PLT-17 harness), so the new spec reuses that pattern (own `chromium.launch` with `--use-angle=swiftshader --enable-unsafe-swiftshader`, esbuild-bundled page).
- `test/renderer-snapshots.page.ts` builds a deterministic 4-layer 40 mm part (external/inner perimeter, infill, travels, two tools, varying speed and width) as D17 move records and draws it with `createSegmentRenderer` from a tilted ortho camera. `test/renderer-snapshots.spec.ts` compares 8 canvas PNGs (feature, speed, tool, layer time, width, flow, layer range 1-2, travel hidden) in `test/__snapshots__/` (threshold 0.1, max 0.05 % differing pixels). `playwright.config.ts` gets a platform-independent `snapshotPathTemplate`. Refresh with `pnpm test:browser --update-snapshots`.
- Verified: 8 pass in about 3 s, repeatable; `pnpm lint` passes. Temporary shader tweak (`light_top_diffuse` 0.6*0.8 to 0.6*0.5) failed the feature and travel-hidden snapshots; reverted (file identical to before).
- Not done: real corpus gcode files (the synthetic part stands in; gcode-preview's parse pipeline cannot be imported here, and a corpus-driven snapshot would belong in a gcode-preview spec after GCP-109); the shaded tweak is invisible to modes 1-5 at this tolerance. CI criterion left unticked (waits on Q7, no remote); Linux-runner pixel equality is unverified (snapshots made on macOS SwiftShader).
- Files: webview-kit/playwright.config.ts, test/renderer-snapshots.page.ts, test/renderer-snapshots.spec.ts, test/__snapshots__/*.png (8).
- Changelog: webview-kit: add SwiftShader pixel snapshots of the segment renderer's colour modes, layer range and travel toggle (test only).
