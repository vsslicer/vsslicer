---
id: 225
title: Run webview integration tests with software WebGL on GPU-less Linux CI
type: bug
priority: P0
effort: S
model: sonnet
sprint: "VSS:SP14"
created: 2026-10-27
---

First full GitHub CI run with every module (run 40603007995, 2026-10-27): on ubuntu-latest under `xvfb-run`, `gcode-preview`'s integration tests fail 5 of 15 on VS Code 1.100.0 ("a stub extension follows a printer feed: timed out waiting for the marker on move N", and "plays, pauses, steps and changes speed on the timeline"). The log shows `Exiting GPU process due to errors during initialization` and `Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag`. macOS (with a GPU) passes them all.

Module: `tooling/test-vscode` (`@vsslicer/test-vscode`, the harness that launches VS Code), layer: adapters (process launch); maybe `.github/workflows/ci.yml`.

Do: launch VS Code with the switches Chromium needs for software WebGL when there's no GPU (e.g. `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`, check what Electron in VS Code 1.100.0 and stable accepts), only on Linux CI or when an env var asks for it, so developer machines keep their GPU. Check `webview-kit`'s and `mesh`'s Playwright/Chromium setups for the same issue.

Done when: the full GitHub CI run passes `gcode-preview`'s integration tests on ubuntu-latest for VS Code 1.100.0 and stable; the change is a test-harness option, not a product change.

## Progress

- test-vscode 0.2.4: `VSSLICER_TEST_SOFTWARE_GL=1` adds the SwiftShader switches; CI sets it on Linux. Run 40647620325: follow-marker and timeline tests pass, but the first `preview.test.ts` test times out on both versions (and 1.100.0 is killed as unresponsive on macOS).
- Root cause (PLT-225-investigator, notes in `.reference/notes/PLT-225-first-preview-hang.md`): under SwiftShader one frame of the GCP-41 51 MB print (~1.5M segments, no layers, all in view) takes ~32 s of the GPU process (measured with a forced `readPixels`; GPU process at ~600 % CPU for ~65 s after open). `large-file.test.ts` ended as soon as the buffers arrived and its `after` closed the preview mid-frame; the teardown and every later preview webview (one origin, one renderer process, one GPU process) waited behind it, so the next test, the first preview test, timed out. Proof: the suite without the 50 MB test passes 14/14; with the big file mounted but not drawn 15/15; holding it open until the GPU idles 15/15. Not a lost context, a probe race, the worker or a harness switch (`--disable-gpu-compositing` changes nothing).
- Fix (gcode-preview 0.7.4, a product change after all): the webview drew the first frame twice (`mount` and `apply(false)`), now once; after each draw a fence is polled (`whenGpuDone`, unit-tested) and `Progress.drawn` is reported when the latest frame is done. `large-file.test.ts` waits for `drawn` (inside its 300 s hang guard) and logs the time: ~64 s under SwiftShader on an M-series Mac, 0.2-0.8 s with a GPU.
- Verified on macOS: `VSSLICER_TEST_SOFTWARE_GL=1 pnpm test:integration` 15/15 on 1.100.0 and stable, no unresponsive window; without it 15/15 on both.