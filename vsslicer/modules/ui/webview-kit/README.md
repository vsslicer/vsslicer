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
  or removed field, bumps `TRANSPORT_SCHEMA_VERSION`. Chunking, ordering, acknowledgements and timeouts (PLT-35)
  build on this envelope.

A `Channel` is `{ post(message), onMessage(listener): unsubscribe }`; the host and webview halves (PLT-36, PLT-37)
adapt `webview.postMessage` and `acquireVsCodeApi()` to it.
