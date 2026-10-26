# @vsslicer/webview-kit

Webview plumbing shared by VSSlicer extensions. Three entry points:

- `@vsslicer/webview-kit/host`: extension-host side (Node); imports nothing browser-only and nothing from `vscode` at runtime.
- `@vsslicer/webview-kit/webview`: webview side (browser); imports nothing from `vscode`.
- `@vsslicer/webview-kit/gl`: WebGL helpers (browser). No GL code yet (PLT-41).

Each exports `TRANSPORT_SCHEMA_VERSION`, the version of the host/webview message envelope.

## Webview HTML and CSP (`/host`)

```ts
import { createWebviewHtml, localResourceRoots } from '@vsslicer/webview-kit/host';

panel.webview.options = {
  enableScripts: true,
  localResourceRoots: localResourceRoots(context.extensionUri, ['dist/webview'], vscode.Uri.joinPath),
};
const uri = (p: string) => panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, p));
panel.webview.html = createWebviewHtml({
  webview: panel.webview,
  scripts: [uri('dist/webview/main.js')],
  styles: [uri('dist/webview/main.css')],
  body: '<div id="root"></div>',
});
```

`createWebviewHtml` makes a fresh 128-bit nonce per call; every script tag carries it (`defer`, classic script).
The policy never contains `unsafe-inline` or `unsafe-eval`. `S` below is `webview.cspSource`; a source containing
`;`, `,` or a line break is refused, so it cannot inject a directive.

| Directive     | Value           | Why                                                                                   |
| ------------- | --------------- | ------------------------------------------------------------------------------------- |
| `default-src` | `'none'`        | Everything not listed is blocked.                                                     |
| `script-src`  | `'nonce-…'`     | Only the kit's script tags run; no inline handlers, no `eval`.                        |
| `style-src`   | `S`             | Stylesheets from the extension; no inline `style` blocks.                             |
| `img-src`     | `S data: blob:` | Extension images, small inline icons, camera frames and snapshots held as blobs.      |
| `font-src`    | `S`             | Codicons and bundled fonts.                                                           |
| `connect-src` | `S`             | `fetch(asWebviewUri(...))` streaming of large local files; no network.                |
| `worker-src`  | `S blob:`       | Parsing workers. Unverified under VS Code until the worker spike (3d-viewer.md OQ 2). |

`localResourceRoots(base, folders, join)` returns exactly those folders under `base`, so the webview never gets
VS Code's default (every workspace folder plus the extension). Absolute paths, drive letters, `..` and empty
folders throw. An empty list allows no local resources.

## Transport protocol (`/host`, `/webview`)

Every message is a plain object `{ tag: 'vsslicer/webview-kit', v, kind, ... }`. Messages without the tag are not
ours and are ignored, so the kit can share a channel with other traffic. `parseEnvelope(message)` validates one:

| `kind`         | Direction | Fields                                                                   |
| -------------- | --------- | ------------------------------------------------------------------------ |
| `hello`        | W to H    | `session`: fresh per webview document load                               |
| `welcome`      | H to W    | `session`: echoes the `hello`                                            |
| `reload`       | either    | `expected`: the sender's version                                         |
| `request`      | either    | `id` (integer ≥ 0, unique per sender), `method`, `payload?`              |
| `response`     | either    | `id`, then `ok: true, payload?` or `ok: false, error: { code, message }` |
| `notification` | either    | `method`, `payload?`                                                     |

- **Payloads are opaque.** The envelope never inspects them, so they may hold `ArrayBuffer`s, which VS Code
  transfers without JSON.
- **Handshake on every load.** The webview calls `handshake(channel)` when its document loads, including after a
  reload or a restore; the host keeps `serveHandshake(channel, { onReady, onMismatch })` subscribed for the
  panel's lifetime and answers each `hello` with a `welcome`. Subscribe the host before setting `webview.html`.
- **Version mismatch.** A message with another `v` fails validation with `VersionMismatchError`
  (`code: 'version-mismatch'`, `expected`, `received`). Whichever side sees it posts a `reload` frame and reports
  the error; the host's `onMismatch` should set `webview.html` again from the current build, and the webview's
  `handshake` rejects. `hello` and `reload` keep their shape in every version, so a mismatch is always detectable.
- **Versioning.** Adding an optional field needs no bump (unknown fields are accepted). A new `kind`, or a changed
  or removed field, bumps `TRANSPORT_SCHEMA_VERSION`.
- **Handshake timeout.** `handshake(channel, session?, { timeoutMs })` rejects with `TimeoutError`
  (`code: 'timeout'`, `ms`) when no `welcome` arrives in time (default 30 s). There is no `hello` retry.

## Buffer transfer (`/host`, `/webview`)

```ts
await sendBuffer(channel, streamId, bytes, { chunkSize: 1 << 20, window: 4, timeoutMs: 30_000 });
const stop = receiveBuffers(channel, { onBuffer(stream, data) {}, onError(stream, error) {} }, { timeoutMs });
```

- **Chunks.** `bytes` (an `ArrayBuffer` or `Uint8Array` view) goes as `notification`s with method
  `webview-kit/chunk` and extra fields `stream`, `seq` (0-based), `count`; the `payload` is an `ArrayBuffer` of at
  most `chunkSize` bytes, owned by that chunk. An empty buffer is one empty chunk. An additive change: no version bump.
- **Ordering.** The receiver files chunks by `seq`, so arrival order does not matter and duplicates are dropped.
  Streams are independent; `stream` must be unique per sender and page load; a receiver forgets finished ids when a `hello` arrives, so a reloaded webview may restart its ids.
- **Backpressure.** After each chunk the receiver posts `webview-kit/ack` with `seq` = chunks held contiguously
  from 0 (cumulative). The sender keeps at most `window` chunks unacknowledged and resolves on the last ack.
- **Timeouts.** The sender rejects with `TimeoutError` after `timeoutMs` without an ack; the receiver reports
  `TimeoutError` through `onError` after `timeoutMs` without the next chunk and drops the stream.
- **Version mismatch.** A `reload` frame, or an ack from another version, rejects the send with
  `VersionMismatchError`. The receiver ignores other-version chunks; the handshake handles the reload.
- Defaults (`TRANSFER_DEFAULTS`) are unmeasured guesses until the postMessage throughput spike.

A `Channel` is `{ post(message), onMessage(listener): unsubscribe }`; the host and webview halves (PLT-36, PLT-37)
adapt `webview.postMessage` and `acquireVsCodeApi()` to it.

## Adapters

Host: `createPanelChannel(panel)` (`@vsslicer/webview-kit/host`) turns a webview panel (structurally typed, no `vscode` import) into a `Channel`; after disposal or a failed `postMessage` it drops messages with one warning. Webview: `createWebviewApi(acquireVsCodeApi)` for typed state (acquires once), `createWindowChannel(post, window)` (keeps messages whose `event.origin === location.origin`, which is what VS Code's outer frame sends from 1.100 to 1.143, whatever `window.parent` is there; otherwise those with `event.source === window.parent`), `watchTheme(domThemeHost())` and `watchVisibility(document, cb)`.

## Move data textures (`/gl`)

`uploadMoveTextures(gl, moves, maxTextureSize?)` uploads a `@vsslicer/gcode-api` move buffer (28-byte records, D17) as `R32UI` textures, seven texels per move, unchanged: the GPU holds 28 bytes per move. It uploads once per texture, at most two `texSubImage2D` calls each, and never again; views and colour modes change uniforms only. Records are split into textures of at most `MAX_TEXTURE_SIZE²` texels (`planMoveChunks`), and consecutive textures share one record, because a move runs from record `r - 1` to record `r`: each texture draws its segments from local record 1. `MOVE_TEXTURE_GLSL` declares `uniform usampler2D uMoves` and the accessors for a chunk-local record:

| Word | Field                                  | Type   | Accessor                 |
| ---: | -------------------------------------- | ------ | ------------------------ |
|  0-2 | position (end point, mm)               | f32 x3 | `movePosition(rec)`      |
|    3 | width (low half), height (high half)   | f16 x2 | `moveWidthHeight(rec)`   |
|    4 | role, tool, flags (byte 19 is padding) | u8 x3  | `moveRoleToolFlags(rec)` |
|    5 | fileOffset                             | u32    | `moveFileOffset(rec)`    |
|    6 | startTime (s)                          | f32    | `moveStartTime(rec)`     |

`pnpm test:browser` checks every field of every record in the shader and compares a render with the real limit against one with a limit of 8 (SwiftShader).

## Segment renderer (`/gl`)

`createSegmentRenderer(gl, moves, { layerStarts?, maxTextureSize? })` uploads the move buffer once (data textures above, a 48-byte index buffer, a palette texture and a layer table) and returns `{ ranges, draw(view), dispose() }`. Each visible move is one instance of an 8-corner prism template (`drawElementsInstanced`, corner from `gl_VertexID`), placed and lit in the vertex shader; the template and shader are ported from libvgcode (OrcaSlicer@09aa0114, AGPL-3.0, provenance in `src/gl/segment-shader.ts`). `draw` sets uniforms only:

- `view`, `projection`: column-major 4x4 (a rigid `view`; the camera position is derived from it).
- `first`, `count`: the visible moves are the global range `first .. first + count - 1`, intersected per texture.
- `roleMask` (bit per `MoveRole`, default all) and `hiddenFlags` (`MoveFlag` bits, e.g. travels; default none).
- `colorMode`: `ColorMode.Feature` (role palette), `Tool`, `Speed` (length over `startTime` difference, mm/s) `LayerTime` (needs `layerStarts`, the `Layer.firstMove` values), `Fan` (part fan %, needs `stateChanges: ParsedFile.stateChanges`) or `Temperature` (the move's tool's hotend target, °C, needs `stateChanges`; without them both are grey); `colorRange` maps speed or layer time to libvgcode's 11-stop gradient, default `ranges`. Unknown values (no planner times) are grey.

`draw` turns depth test and depth writes on and culling and blending off, and leaves that state, its program, VAO and textures on units 0-2 bound. Travels (width 0) are drawn 0.1 mm wide.

In a context another renderer owns, such as three.js's `WebGLRenderer` (which caches GL state), pass `foreign: true`: creating the renderer and each `draw` save the state they change and restore it after (`saveGlState(gl)`, which returns the restore function: program, VAO, active unit, `TEXTURE_2D` on units 0-2 and the active unit, `DEPTH_TEST`, `CULL_FACE`, `BLEND`, depth mask, `PIXEL_UNPACK_BUFFER` and the unpack parameters). Draw after `renderer.render(scene, camera)` with `camera.matrixWorldInverse.elements` and `camera.projectionMatrix.elements`; the ribbon depth-tests against the scene. Framebuffer and viewport are left to the caller. three.js is a test-only dev dependency (`test/three-foreign.spec.ts`).

## Context loss (`/gl`)

`trackContextLoss(canvas, { onLost?, onRestored? })` returns `{ add(build), dispose() }`. `add` runs `build` now and again after each `webglcontextrestored`; `build` creates the buffers, textures and programs from CPU data it closes over (e.g. `() => { textures = uploadMoveTextures(gl, moves); }`), optionally returning a function that frees them. The registry cancels `webglcontextlost` (otherwise the browser never restores), rebuilds in registration order, then calls `onRestored` so the renderer redraws; nothing is requested from the host. `add` returns a remover; it and `dispose()` call the free function of the entry's latest build (each restore replaces it) and drop the entry and with it the CPU data. `dispose()` therefore frees every live entry.

## Testing in Playwright (`/testing`)

`attachFakeHost(page)` installs a stand-in for VS Code's webview environment before the page loads and returns the host end as a `Channel`, so `serveHandshake`, `host.post` and `host.onMessage` work as on a real panel. The stub reproduces what VS Code does (measured in 1.143.1): `window.parent === window`, host messages with `event.origin === location.origin` and an unreachable `source`, and `acquireVsCodeApi` usable once per page. Posts are also recorded in `window.__vscode.messages`, state in `window.__vscode.state`. Serve the page from a secure origin such as `http://localhost` (`about:blank` has no `crypto.randomUUID`). Messages cross as JSON, so `ArrayBuffer` payloads do not survive.

```ts
import { attachFakeHost, serveHandshake } from '@vsslicer/webview-kit/testing';

test('webview answers ping', async ({ page }) => {
  const host = await attachFakeHost(page); // before goto
  serveHandshake(host, { onReady() {}, onMismatch() {} });
  host.onMessage((m) => (m as { type?: string }).type === 'ping' && host.post({ type: 'pong' }));
  await page.goto(url); // a page that loads the webview bundle
});
```

## Integration test

`pnpm test:integration` runs `test/integration/transfer.test.ts` inside VS Code (`engines.vscode` minimum and stable, `@vsslicer/test-vscode`): 200 MiB from the extension host into a real webview, SHA-256 compared, time and memory printed (about 0.3 s to send, 0.5 s to hash on an M1 Pro). `test/integration/lifecycle.test.ts` checks that hide and show restores `setState` state, that disposing mid-transfer leaves one warning and no listener, and that the page reports no CSP violation or console error (the fixture webview forwards them, since the host cannot read its console). The fixture extension in `test/integration/fixture` has a `main` on purpose: without one VS Code serialises `ArrayBuffer`s sent to a webview as JSON. `VSSLICER_TRANSFER_MIB` overrides the size for debugging. It runs in the CI `test:integration` step; it is not slow enough for a nightly.
