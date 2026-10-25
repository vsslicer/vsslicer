# Changelog

## 0.3.0

- PLT-35: chunked `ArrayBuffer` transfer (`sendBuffer`, `receiveBuffers`) with configurable chunk size, ordering by `seq`, cumulative acks with a send window for backpressure, and `TimeoutError` on silence; `handshake` takes `{ timeoutMs }`. Protocol in the README.

## 0.2.0

- PLT-34: transport envelope (`hello`, `welcome`, `reload`, `request`, `response`, `notification`) with `parseEnvelope`, `VersionMismatchError`, and the per-load handshake (`serveHandshake` on the host, `handshake` in the webview) over a `Channel` port. Protocol in the README.
- PLT-32: `createWebviewHtml` with a fresh nonce and a `default-src 'none'` CSP (`contentSecurityPolicy`), and `localResourceRoots`. Policy documented per directive in the README.

## 0.1.0

- PLT-30: package skeleton with the `./host` (Node), `./webview` and `./gl` (browser) entry points, each exporting `TRANSPORT_SCHEMA_VERSION`. No transport or GL code yet.
