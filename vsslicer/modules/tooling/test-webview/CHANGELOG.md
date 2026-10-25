# Changelog

## 0.1.0

- Playwright harness: Chromium with SwiftShader WebGL, `test:snapshot`, Linux-only snapshot writing (`UPDATE_SNAPSHOTS=1`).
- `startWebviewHost`: serves a page that mimics a VS Code webview host (`acquireVsCodeApi` stub, CSP, bundle loader).
- `webglRenderer`: reads `WEBGL_debug_renderer_info`.
