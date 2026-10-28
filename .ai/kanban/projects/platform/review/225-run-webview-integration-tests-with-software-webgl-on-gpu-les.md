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