# Changelog

## 0.2.3

- Re-range `@vsslicer/webview-kit` to ^0.8.0 (SP12 release).

## 0.2.2

- Depends on webview-kit ^0.7.0 (re-lock only).

## 0.2.1

- Depends on webview-kit ^0.6.0 (re-lock only).

## 0.2.0

- The webview host stub is now the kit's (`@vsslicer/webview-kit/testing`, new dependency ^0.5.0): adds `window.parent/top === window`, `frameElement` null, same-origin host messages and `__vscode.deliver`. `stubScript` is still exported. (PLT-38)

## 0.1.2

- Build in `prepack` (PLT-180); dev: `@vsslicer/example-extension` ^0.7.3.

## 0.1.1

- Dev: `@vsslicer/tooling` ^0.8.1, `@vsslicer/example-extension` ^0.7.2 (the old `^0.3.0` could not match 0.7.x); lockfile pins current versions only. (PLT-179)

## 0.1.0

- Playwright harness: Chromium with SwiftShader WebGL, `test:snapshot`, Linux-only snapshot writing (`UPDATE_SNAPSHOTS=1`).
- `startWebviewHost`: serves a page that mimics a VS Code webview host (`acquireVsCodeApi` stub, CSP, bundle loader).
- `webglRenderer`: reads `WEBGL_debug_renderer_info`.
