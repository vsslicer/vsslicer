---
id: 38
title: Provide the Playwright webview stub from the kit
type: feature
priority: P0
effort: M
model: sonnet
area: [webview-kit]
story: US8
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-38-worker
depends_on: [37, 17]
created: 2026-10-25
---

Fake `acquireVsCodeApi` and a fake host end of the transport so every project can snapshot its webview in plain Chromium.

## Acceptance criteria

- [x] The sample webview exchanges a typed message with the fake host in Playwright
- [x] Stub exported as `@vsslicer/webview-kit/testing`; documented with an example
- [x] Harness loader from E1 uses it instead of its own stub

## Tasks

- [x] Write the stub and fake host
- [x] Replace the harness stub
- [x] Document

## Progress

Done except the harness swap. New `@vsslicer/webview-kit/testing` entry: `attachFakeHost(page)` (call before goto) installs the stub as an init script and returns the host end as a `Channel`; `webviewStubScript` is also exported. The stub reproduces PLT-31's measurements: `window.parent/top === window`, `frameElement` null, host messages dispatched with `event.origin === location.origin` and `source` null, `acquireVsCodeApi` once per page, posts recorded in `window.__vscode.messages`/`state` (same shape as test-webview's stub). Playwright spec test/webview-stub.spec.ts: a sample webview built on the kit's `handshake` and `createWindowChannel` exchanges a typed ping/pong with the fake host (this only passes with the PLT-188 fix); also asserts the VS Code behaviours and once-only acquire. README section with example; CHANGELOG under Unreleased; entries.test covers bundling the new entry. Verified: `pnpm lint`, `pnpm test` (106), `pnpm build`, `npx playwright test webview-stub` (3 pass). Not done: "Harness loader from E1 uses it" and the matching task. That means editing @vsslicer/test-webview, outside this lane, and it needs a published webview-kit with `/testing` (PUBLISH no here); the coordinator should release webview-kit, then swap `stubScript` in test-webview/src/domain/webviewPage.ts for the kit's. Limits: messages cross as JSON (no ArrayBuffer payloads), noted in code and README.

Files: vsslicer/modules/webview-kit/src/adapters/webview-stub.ts, src/testing/index.ts, tsconfig.testing.json, test/webview-stub.spec.ts, test/entries.test.ts, package.json (exports ./testing, build step), README.md, CHANGELOG.md.

Review passed; harness swap waits on the kit release

Harness swap done: test-webview 0.2.0 (published) depends on @vsslicer/webview-kit ^0.5.0; `stubScript` in src/domain/webviewPage.ts is now `webviewStubScript` from `@vsslicer/webview-kit/testing` (public API unchanged; the import is a plain package string, no Playwright-bound adapter in domain). Verified: lint, test (4), build, `playwright test` (example-extension webview bundle loads under the kit stub and posts ready), clean-store `pnpm install --frozen-lockfile` then tests again. example-extension has no webview tests of its own; test/webview.spec.ts in test-webview is its consumer. Files: vsslicer/modules/test-webview/{package.json,pnpm-lock.yaml,CHANGELOG.md,src/domain/webviewPage.ts}.
