# Changelog

## Unreleased

- PLT-190: `uploadMoveTextures` and `createSegmentRenderer` throw a TypeError for a typed-array view instead of uploading scrambled data.
- PLT-191: the segment renderer reads each chunk's next-start value once at create, so it no longer keeps the CPU move buffer alive until dispose.

## 0.5.0

- PLT-48: `gl` entry: `createSegmentRenderer(..., { foreign: true })` draws into a context three.js owns: create and `draw` save and restore the GL state they change with the new `saveGlState(gl)`. `draw` now also turns depth writes on and culling and blending off. SwiftShader spec with three.js 0.186.1 (dev dependency only): a textured plane plus segments composite, unchanged GL state and an identical next three.js frame, and the leak seen without foreign mode.
- PLT-47: SwiftShader spec `test/memory.spec.ts` renders 15 million synthetic moves (generated in 1M-record chunks) and prints GPU bytes per move; it fails above the 28-byte layout (plus 0.2 for the layer table and padding). Takes about 3 minutes.
- PLT-45: `testing` entry: `spyGlUploads(gl)` wraps a WebGL2 context, counts `texImage2D`, `texSubImage2D`, `bufferData` (and the 3D and sub-data variants) and the `texStorage2D` bytes; `test/gl-upload-spy.spec.ts` shows that colour-mode switches and range sweeps on the segment renderer upload nothing.
- PLT-40: integration tests (`test/integration/lifecycle.test.ts`, VS Code min and stable): hide and show again restores `setState` state; disposing mid-transfer leaves no listener, one warning and a `TimeoutError` for the sender; the webview reports its own CSP violations and console errors (it cannot be read from the extension host), none in a normal session, and a probe `fetch` proves the capture sees a violation.
- PLT-39: integration test (`pnpm test:integration`, VS Code min and stable via `@vsslicer/test-vscode`): 200 MiB from the extension host into a real webview in 4 MiB chunks, SHA-256 compared (`crypto.subtle.digest` in the webview), time and memory printed. It found two bugs, fixed here: `sendBuffer` with a Node `Buffer` sent each chunk as the whole payload (`Buffer.slice` is a view), and `createWindowChannel` dropped every host message in VS Code 1.100, where `window.parent` is neither the window nor the sender: it now accepts `event.origin === location.origin` always.
- PLT-44: `gl` entry: `createSegmentRenderer(gl, moves, { layerStarts?, maxTextureSize? })` draws every visible move as one instance of an 8-corner prism (template and vertex shader ported from libvgcode, OrcaSlicer@09aa0114, with upstream copyright), reading the PLT-42 data textures. `draw(view)` sets uniforms only: global `first`/`count` range, role and flag masks, `ColorMode` feature, tool, speed or layer time from a palette texture, `colorRange` (default `ranges`). SwiftShader spec: two ranges, chunked equals one texture in every mode, masks, colour modes.
- PLT-43: `gl` entry: `trackContextLoss(canvas, { onLost?, onRestored? })` cancels `webglcontextlost` and, on `webglcontextrestored`, re-runs every builder registered with `add(build)` (textures from `uploadMoveTextures`, programs, buffers) from the CPU data it closes over, then calls `onRestored`; no host message. Removing an entry or `dispose()` calls the free function returned by the entry's latest build (not the first) and drops the CPU data; `dispose()` now frees every live entry. Unit test plus SwiftShader spec with `WEBGL_lose_context`.
- PLT-38: `testing` entry: `attachFakeHost(page)` and `webviewStubScript` give Playwright a fake `acquireVsCodeApi` and the host end of the transport as a `Channel`, mimicking VS Code (`window.parent === window`, host messages with `event.origin === location.origin`). Playwright spec with a sample webview.
- PLT-42: `gl` entry: `uploadMoveTextures` puts the 28-byte move records into `R32UI` data textures (7 texels per move, no repacking), chunked to `MAX_TEXTURE_SIZE²` with one shared record between chunks (`planMoveChunks`), uploaded once per chunk; `MOVE_TEXTURE_GLSL` holds the shader accessors. Layout in the README; SwiftShader Playwright spec compares a small-limit render against one texture.
- PLT-188: `createWindowChannel` accepts host messages when `window.parent === window` (VS Code's webview) by checking `event.origin === location.origin`; foreign origins are dropped. `WindowLike` gains `location.origin`.
- PLT-41: `gl` entry: `createGl2Context` returns a hardware WebGL2 context or a `GlContextError` with cause `no-webgl2`, `hardware-acceleration-disabled` or `creation-refused` (messages carry the `argv.json` hint); `showGlFailure` replaces the canvas with an alert. Playwright spec (`pnpm test:browser`).
- PLT-187: `receiveBuffers` forgets finished stream ids on a `hello`, so a reloaded webview that reuses an id is delivered instead of ignored.

## 0.4.2

- PLT-36: `createPanelChannel` counts a `postMessage` that resolves `false` (VS Code's "could not be delivered") as dropped, with the same one warning in total.
- PLT-37: test for `domThemeHost` (jsdom): a `--vscode-*` style change and a class change on the root element each fire the observer once.

## 0.4.1

- PLT-35: `receiveBuffers` remembers the last 256 finished or failed stream ids and ignores their later chunks, so a late duplicate no longer fires `onBuffer` twice or raises a spurious `TimeoutError`.

## 0.4.0

- PLT-37: webview adapters: `createWebviewApi` (typed state, `acquireVsCodeApi` called once), `createWindowChannel` (accepts only messages whose source is the VS Code host frame), `watchTheme`/`domThemeHost` (`--vscode-*` tokens with change events) and `watchVisibility`.
- PLT-36: host adapter `createPanelChannel`: structural panel, envelope-only pass-through, messages after disposal or a failed `postMessage` dropped with one warning, listeners released on disposal; a reload re-handshakes via `serveHandshake`.

## 0.3.0

- PLT-35: chunked `ArrayBuffer` transfer (`sendBuffer`, `receiveBuffers`) with configurable chunk size, ordering by `seq`, cumulative acks with a send window for backpressure, and `TimeoutError` on silence; `handshake` takes `{ timeoutMs }`. Protocol in the README.

## 0.2.0

- PLT-34: transport envelope (`hello`, `welcome`, `reload`, `request`, `response`, `notification`) with `parseEnvelope`, `VersionMismatchError`, and the per-load handshake (`serveHandshake` on the host, `handshake` in the webview) over a `Channel` port. Protocol in the README.
- PLT-32: `createWebviewHtml` with a fresh nonce and a `default-src 'none'` CSP (`contentSecurityPolicy`), and `localResourceRoots`. Policy documented per directive in the README.

## 0.1.0

- PLT-30: package skeleton with the `./host` (Node), `./webview` and `./gl` (browser) entry points, each exporting `TRANSPORT_SCHEMA_VERSION`. No transport or GL code yet.
