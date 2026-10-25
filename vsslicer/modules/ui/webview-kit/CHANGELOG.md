# Changelog

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
