# Changelog

## 0.7.3

- Build in `prepack` (PLT-180); dev: `@vsslicer/example` ^0.3.2, `@vsslicer/test-vscode` ^0.2.3.

## 0.7.2

- Dev: `@vsslicer/tooling` ^0.8.1, `@vsslicer/test-vscode` ^0.2.2, `@vsslicer/example` ^0.3.1; lockfile pins current versions only. (PLT-179)

## 0.7.1

- Depend on `@vsslicer/test-vscode` 0.2.1: the VS Code download is shared (`~/.cache/vsslicer/vscode-test`, or `VSCODE_TEST_CACHE`) instead of kept in this module's `.vscode-test`.

## 0.7.0

- Compile the integration suites to `dist-test/` and depend on `@vsslicer/test-vscode` 0.2.0. 0.6.0 was published mid-change by a concurrent run (it ships `dist/test/` and an old range) and is superseded.

## 0.6.0

- Add `pnpm test:integration` (`@vsslicer/test-vscode` 0.1.2): mocha suite in `test/integration/` that runs in a real VS Code on the `engines.vscode` minimum and on stable; it activates the extension, checks both commands are registered, runs `hello` and opens the webview. Results and VS Code logs go to `test-results/integration/<version>/`. The unit script is now `node --test test/*.test.ts`.

## 0.5.0

- Add `pnpm package` (`vsslicer-package` from `@vsslicer/tooling` 0.7.0): builds `example-extension-0.5.0.vsix` and asserts its content, size budget (200 KB, `"vsslicer": { "sizeBudgetKB" }`), `repository` tag and licence. `.vscodeignore` whitelists the bundles (no maps, no meta files), `LICENSE`, `THIRD-PARTY-NOTICES.md`, `README.md` and `CHANGELOG.md`; `PROVENANCE.md` is no longer shipped.
- Add `README.md` and the `repository` field (placeholder owner until the remote exists, Q7).
- Depend on `@vsslicer/tooling` 0.7.0.

## 0.4.0

- Build `THIRD-PARTY-NOTICES.md` with `third-party-notices` (`@vsslicer/tooling` 0.6.0) from the extension and webview bundles' metafiles and ship it in `files`; the build fails on a bundled dependency outside the licence allow-list. The extension currently bundles only `@vsslicer/example` (ours), so the file lists no third-party packages.

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
