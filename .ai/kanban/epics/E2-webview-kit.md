---
id: E2
title: Build @vsslicer/webview-kit (WebGL2 renderer core, binary message transport, CSP helper)
status: reviewed
initiative: I1
project: PLT
order: 2
depends_on: [E1]
rows: []
---

Delivers `@vsslicer/webview-kit`, the library every VSSlicer webview is built on: safe WebGL2 context creation with a clear failure message, an instanced-segment renderer core that draws millions of moves at about 28 bytes each (D6), a typed message transport between the extension host and the webview that moves ArrayBuffers without JSON, a CSP helper, and helpers for the webview lifecycle (hidden, restored, disposed). Its users are E5 (the G-code preview), E10 (the model viewer, which draws the same segments inside its three.js scene), and later the camera, profile-form and filament webviews. It also answers two I1 spikes the roadmap assigns to the webview layer: `postMessage` throughput and the WebGPU probe.

## Scope

- **In:** `packages/webview-kit` with three entry points.
  - `webview-kit/host` (extension host, Node): `createWebviewHtml({ webview, scripts, styles })` with a fresh nonce and a CSP of `default-src 'none'` plus `webview.cspSource`, `script-src 'nonce-…'`, `style-src`, `img-src`, and `worker-src` as the spike decides (`3d-viewer.md` §2; `vscode-platform.md` §2 "CSP"); `localResourceRoots` helper; the host half of the transport.
  - `webview-kit/webview` (browser): the webview half of the transport; `acquireVsCodeApi` wrapper with typed `getState`/`setState`; theme tokens read from VS Code's CSS variables and change events; a WebGL2 context factory that reports failure causes (no WebGL2, context creation refused after Chromium's SwiftShader removal, hardware acceleration disabled in `argv.json`) as a structured error the caller shows as a message, and handles `webglcontextlost`/`restored` by rebuilding GPU resources from the CPU-side arrays.
  - `webview-kit/gl` (browser): the segment renderer core. One instanced segment template; per-move attributes in 2D data textures chunked to `MAX_TEXTURE_SIZE`; visibility as a contiguous `first/count` range plus role and travel masks; colouring in the shader from per-move scalars and a palette texture, so switching colour mode changes a uniform and scrubbing changes a range, never re-uploads geometry (`gcode-viewer-simulation.md` §6, §7). It draws into a context it creates or into a foreign WebGL2 context with explicit state save and restore, which is how VWR draws the G-code ribbon inside three.js (`3d-viewer.md` §6).
- **Transport:** typed request, response and notification messages with a schema version and a handshake on every webview (re)load; ArrayBuffers sent as transferables (`SerializableObjectWithBuffers`, `vscode-platform.md` §2) in chunks of a configurable size with acknowledgement-based backpressure; messages to a disposed webview are dropped with one logged warning, not an exception.
- **Test support:** a webview stub for the E1 Playwright harness (fake `acquireVsCodeApi`, fake host end of the transport) so every project can snapshot its webview in plain Chromium.
- **Code origin:** written new in TypeScript. The renderer follows libvgcode's technique (PrusaSlicer, AGPL-3.0); under D2 its shader and layout code may be ported, with the upstream copyright line and a `Ported from PrusaSlicer@<commit>:<path>` line per file.
- **Out:** the G-code move layout and parser (E3 owns it; the kit takes its typed arrays as input); triangle meshes, picking and three.js (VWR); a WebGPU backend (only if the probe passes on all three platforms, D6, as a later epic); `SharedArrayBuffer` (assumed unavailable, `3d-viewer.md` §2).

## Feature-matrix rows

None. This is platform work the §10 rows (GCP) and §3/§9 rows (VWR) rest on.

## Acceptance criteria

- [ ] Context failure: in Playwright, Chromium started with WebGL disabled shows the kit's failure message with its cause; no blank canvas, no uncaught error (regression caught: a black viewer on GPU-less Linux, `3d-viewer.md` §2).
- [ ] Context loss: forcing `WEBGL_lose_context.loseContext()` then `restoreContext()` redraws the same image (snapshot match) without a new message from the host.
- [ ] Renderer: snapshot tests for a fixed synthetic move set in feature, speed, tool and layer-time colour modes, light and dark theme, at two visible ranges.
- [ ] Switching colour mode or visible range issues no `texImage2D`, `texSubImage2D` or `bufferData` call (spy on the context); regression caught: re-uploading the whole file per slider step.
- [ ] Texture chunking: a move count above `MAX_TEXTURE_SIZE²` per texture renders across several textures identically to a reference made with an artificially small limit.
- [ ] Memory: 15 million synthetic moves (the 500 MB budget case) render in headless Chromium with GPU-side bytes per move at or under the stated layout, measured and printed by the test.
- [ ] Foreign context: the renderer draws into a three.js `WebGLRenderer` context and three.js renders correctly afterwards (snapshot of a mesh plus segments).
- [ ] Transport: unit tests over a fake channel for ordering, chunk reassembly, backpressure, timeout (named error to the caller), and version mismatch after a webview reload; an `@vscode/test-electron` test transfers 200 MB host-to-webview and asserts it arrives intact (hash).
- [ ] Lifecycle: an `@vscode/test-electron` test hides and re-shows a sample webview editor and the state set with `setState` is restored; disposing it mid-transfer logs one warning and leaks no listener.
- [ ] CSP: unit test asserts the generated policy contains no `unsafe-inline` or `unsafe-eval`; the sample webview logs no CSP violation in VS Code's webview developer console (checked in the integration test through the console log capture).
- [ ] Spike results recorded as PLT decisions: `postMessage` with transferables versus `fetch(asWebviewUri)` at 50, 200 and 500 MB on Windows, macOS and Linux; WebGPU `requestAdapter()` inside a webview on the same three; `Worker` from `blob:` and from `asWebviewUri` under the kit's CSP.

Verified on the owner's machines and the CI runners only; no printer is involved. GPU-less CI uses SwiftShader, so performance numbers come from the owner's machines and are recorded with OS, GPU and VS Code version.

## Dependencies

- Needs: E1 (monorepo, Playwright and `@vscode/test-electron` harnesses).
- Coordinates with: E3 on the per-move typed-array layout (position f32×3, width and height f16, role/tool/flags u8, file offset u32, start time f32; `gcode-viewer-simulation.md` §6). The kit consumes it; GCP owns it.
- Exposes: the `host`, `webview` and `gl` entry points above to E5, E10 and every later webview; the Playwright webview stub to all projects; the spike decisions to GCP and VWR.

## Risks and spikes

- **`postMessage` throughput** for 50 to 500 MB is unpublished (`vscode-platform.md` open questions). Spike in the first sprint; if transferables are slow, the kit streams through `fetch(asWebviewUri)` for file-backed data and keeps messages for commands.
- **WebGPU in webviews** is unverified (`3d-viewer.md` open question 1). Probe extension of about 20 lines; WebGL2 stays the baseline either way (D6).
- **Workers in webviews under CSP** (`3d-viewer.md` open question 2): decides whether webview-side parsing is possible; GCP parses in the extension host `worker_threads` regardless.
- **Linux without GPU** loses WebGL entirely after the SwiftShader removal: the failure message is the mitigation; a software fallback is out.

## Eng review

- Scope challenge: considered putting three.js into the kit so both viewers share one stack. Rejected: the G-code renderer is a few hundred lines of raw WebGL2 (`gcode-viewer-simulation.md` §7) and three.js would add per-object overhead there; instead the foreign-context mode lets VWR combine them. Kept the WebGPU backend out until the probe passes.
- Tests: the call-count spy and the chunking reference are the two tests that catch performance regressions a snapshot would miss.
- Blast radius: the kit runs inside each webview, so a crash takes down one editor tab, not the extension host; the transport is the only host-side part and it never parses payloads beyond the envelope.
- Reversibility: entry points are versioned with the transport schema version, so a webview built against an older kit gets a version-mismatch error and a reload, not corrupted data.
- Zero silent failures: context refusal, context loss, transfer timeout, version mismatch and messages to disposed webviews each have a defined user-visible or logged result and a test.
- Changed because of the review: added the context-failure and context-loss paths and the foreign-context mode; removed three.js from scope.

## Coordinator reconciliation

- Raw WebGL2 core, no three.js in the kit; VWR uses three.js for the model viewer and draws the kit's G-code layer into its own context. Owns the postMessage ArrayBuffer throughput spike and the WebGPU probe.
