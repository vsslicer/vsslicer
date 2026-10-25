---
id: 14
title: Create the sample extension and the sample webview fixture
type: feature
priority: P0
effort: S
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [3]
created: 2026-10-25
---

Module: `example-extension`, with the webview fixture in `vsslicer/fixtures/sample-webview`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

A minimal extension (`fixtures/sample-extension`) with one command and one webview that the integration and snapshot harnesses and the kit tests use.

## Acceptance criteria

- [x] Bundles with the esbuild helper; activates and registers the command
- [x] Contains `PROVENANCE.md`
- [x] The webview page loads a bundle built from `fixtures/sample-webview`

## Tasks

- [x] Write the extension and the webview bundle
- [x] Add `PROVENANCE.md`
- [x] Build through Turborepo

## Progress

Done. `fixtures/sample-extension` is read as `vsslicer/modules/example-extension` (module model), published as 0.3.0. The webview is NOT in `fixtures/sample-webview`: modules may not reach into other folders and a separate module is overkill, so its source is `src/presentation/webview/main.ts` in the extension, built by a second esbuild call (browser, iife) to `dist/webview.js` (ships in the VSIX; harnesses PLT-15/17 consume it). New command `vsslicer.example.webview` opens a WebviewPanel; HTML (`webviewHtml.ts`) has a CSP with nonce and `cspSource`, script via `asWebviewUri`. Added PROVENANCE.md, CHANGELOG, tests (both commands registered, HTML CSP/nonce/bundle URI, bundle exists). Verified: pnpm lint/build/test (3 pass), published, empty-store frozen install then build/test/lint. Not run: the webview in a real VS Code (PLT-15/17). Tooling stays 0.4.0.
