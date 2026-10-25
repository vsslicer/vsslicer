---
id: 17
title: Add the Playwright harness with SwiftShader WebGL and a webview stub loader
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-17-worker
depends_on: [14, 9]
created: 2026-10-25
---

Module: new `test-webview` (`@vsslicer/test-webview`, the Playwright snapshot harness and webview stub loader: heavy dependencies stay out of `tooling`). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Pinned Playwright and Chromium with `--use-angle=swiftshader --enable-unsafe-swiftshader`, a page loader that stubs `acquireVsCodeApi`, and a WebGL2 triangle rendered and compared to a snapshot.

## Acceptance criteria

- [x] The triangle snapshot matches within a stated pixel tolerance
- [x] The harness exposes `test:snapshot`; versions pinned exactly
- [x] Snapshots are written only when `UPDATE_SNAPSHOTS=1` and the Linux runner is detected
- [x] A webview bundle from the sample webview loads with the stub

## Tasks

- [x] Install and pin Playwright
- [x] Write the loader and stub
- [x] Render and snapshot the triangle
- [x] Document tolerance and regeneration

## Progress

New module `vsslicer/modules/test-webview` (`@vsslicer/test-webview` 0.1.0, published to the local registry). "Repository root" read as `vsslicer/`.

Done: `@playwright/test` 1.64.1 pinned exactly; Chromium launched with SwiftShader args; `startWebviewHost(bundlePath)` serves a page with a real-style CSP, an `acquireVsCodeApi` stub (records postMessage, get/setState, single acquire) and the bundle; `webglRenderer(page)`; `trianglePage`. Specs: SwiftShader renderer check, `@vsslicer/example-extension` 0.3.0 `dist/webview.js` posts `{type:'ready'}`, triangle snapshot (`maxDiffPixelRatio 0.002`, `threshold 0.1`, documented in README). Snapshots are written only with `UPDATE_SNAPSHOTS=1` on Linux; `-u`/`--update-snapshots` and UPDATE_SNAPSHOTS off Linux are refused with an error; on macOS the snapshot test skips with a message when no platform baseline exists. Only `triangle-linux.png` is committed.

Verified: lint, build, vitest (4), `pnpm test:snapshot` on macOS (2 pass, snapshot skipped); in `mcr.microsoft.com/playwright:v1.64.1-noble` via Docker: write run, second run matches, a changed triangle colour fails (0.32 of pixels). Empty-store `CI=true npm_config_store_dir=<tmp> pnpm install --frozen-lockfile` then lint/build/test/test:snapshot OK (browsers excluded). Docker note: the npm_config registry override does not work (the lockfile holds tarball URLs); a TCP forward of container localhost:4873 to host.docker.internal:4873 does. See `.reference/notes/PLT-17-playwright.md`.

Not done: CI job (PLT-18); the stub moves into the webview kit in PLT-38.

Files: vsslicer/modules/test-webview/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,.npmrc,.prettierignore,.gitignore,LICENSE,README.md,CHANGELOG.md,eslint.config.mjs,vitest.config.ts,tsconfig.json,tsconfig.test.json,playwright.config.ts,src/index.ts,src/domain/webviewPage.ts,src/adapters/webviewHost.ts,src/adapters/webgl.ts,test/webviewHost.test.ts,test/triangle.spec.ts,test/webview.spec.ts,test/triangle.spec.ts-snapshots/triangle-linux.png}
