---
id: US4
title: An extension author runs unit, integration and webview snapshot tests in CI with harnesses proven able to fail
status: reviewed
epic: VSS:E1
---

Extension and webview authors in every project get two more harnesses beside vitest: `@vscode/test-electron` against the minimum and stable VS Code on all three operating systems and VSCodium on Linux, and Playwright with Chromium and SwiftShader WebGL for webview snapshots. Meta-tests prove each one turns CI red.

## Acceptance criteria

- [ ] The `@vscode/test-electron` harness activates a sample extension on the minimum and stable VS Code on all three OSes and on VSCodium on Linux
- [ ] The Playwright harness loads a webview bundle in Chromium with a stubbed `acquireVsCodeApi`, renders a WebGL2 triangle with SwiftShader and matches its snapshot within a stated pixel tolerance; snapshots are generated only on the Linux runner
- [ ] A failing `@vscode/test-electron` test and a changed Playwright snapshot each turn the CI job red (meta-tests recorded in the pull request)

## Out of scope

- Browser-build tests with `@vscode/test-web` (E48); the webview-kit stub (US8).
