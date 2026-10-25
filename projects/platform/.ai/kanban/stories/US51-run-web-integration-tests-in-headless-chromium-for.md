---
id: US51
title: "Run web integration tests in headless Chromium for every pull request that touches a browser path"
status: reviewed
epic: VSS:E48
---

As a maintainer, I want `@vscode/test-web` integration tests run in CI when a pull request touches a browser path, so that web regressions are caught before release.

## Acceptance criteria

- [ ] A shared runner in the tooling module serves an extension to `@vscode/test-web` in headless Chromium and runs its mocha tests; a failing test exits non-zero
- [ ] CI runs the web tests for exactly the modules that declare a `browser` entry and that changed (or whose dependencies changed)
- [ ] The golden-file corpus parses to the same summary statistics in the parser's Web Worker as on desktop, with the same test data in both runtimes

## Out of scope

- Browsers other than Chromium; Playwright snapshot tests (they exist already).
