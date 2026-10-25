# Changelog

## 0.3.0

- Add the `vsslicer.example.webview` command: opens a WebviewPanel whose HTML (CSP with nonce and `cspSource`, `asWebviewUri`) loads `dist/webview.js`, an esbuild browser iife built from `src/presentation/webview/main.ts` that posts a `ready` message. This is the stable sample webview bundle for the test harnesses.
- Add `PROVENANCE.md`.

## 0.2.1

- Depend on `@vsslicer/example` 0.3.0 and `@vsslicer/tooling` 0.3.0. Tests stay on `node --test` (the VS Code API is injected, nothing to gain from vitest here).

## 0.2.0

- Rewrite in TypeScript; `dist/extension.js` is now one esbuild bundle (`vscode` external, `@vsslicer/example` inlined), built with `@vsslicer/tooling` 0.2.0.
- Depend on `@vsslicer/example` ^0.2.0.

## 0.1.0

- Initial scaffold.
