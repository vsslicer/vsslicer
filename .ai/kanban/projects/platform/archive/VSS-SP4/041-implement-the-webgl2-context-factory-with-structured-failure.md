---
id: 41
title: Implement the WebGL2 context factory with structured failure causes
type: feature
priority: P0
effort: M
model: sonnet
area: [webview-kit]
story: US9
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-41-worker
depends_on: [30, 17]
created: 2026-10-25
---

Create a WebGL2 context or return a structured error naming the cause: no WebGL2, creation refused after Chromium's SwiftShader removal, hardware acceleration disabled in `argv.json`.

## Acceptance criteria

- [x] In Playwright, Chromium with WebGL disabled shows the kit's failure message with its cause; no blank canvas, no uncaught error
- [x] Each cause has a unit test and a human-readable message
- [x] Message includes the `argv.json` hint where relevant

## Tasks

- [x] Define error types
- [x] Detect causes
- [x] Render the message element
- [x] Test in Playwright

## Progress

Done in `gl` entry of webview-kit: `createGl2Context` (never throws; tries `failIfMajorPerformanceCaveat`, a context that exists only without it means software rendering, so cause `hardware-acceleration-disabled`), `GlContextError`, `showGlFailure`. Messages for creation-refused and hardware-acceleration-disabled carry the argv.json hint; no-webgl2 does not (not relevant there).

Verified: `pnpm lint`, `pnpm test` (101 pass, jsdom unit test per cause), `pnpm test:browser` (Playwright, Chromium with --disable-3d-apis --disable-gpu: alert with cause, canvas gone, no page error). Not verified: a real Chromium with SwiftShader removed, or argv.json set (the webview cannot read argv.json; the cause is inferred).

Files: vsslicer/modules/webview-kit/{src/gl/context.ts, src/gl/index.ts, test/gl-context.test.ts, test/gl.spec.ts, playwright.config.ts, package.json, pnpm-lock.yaml, CHANGELOG.md}.
