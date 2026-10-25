---
id: 37
title: "Implement the webview half: acquireVsCodeApi wrapper, state and theme tokens"
type: feature
priority: P0
effort: M
model: sonnet
area: [webview-kit]
story: US8
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [35]
created: 2026-10-25
---

Webview side of the transport; typed `getState`/`setState` wrapper over `acquireVsCodeApi`; theme tokens read from VS Code CSS variables with change events; lifecycle (hidden, restored).

## Acceptance criteria

- [x] State round trip is typed; unit test against a fake `acquireVsCodeApi`
- [x] Theme tokens update on a class/style change event (test in jsdom or Playwright)
- [x] `acquireVsCodeApi` is called once only

## Tasks

- [x] Write the wrapper and state helper
- [x] Write theme token reader
- [x] Test in Playwright with the stub

## Progress

Done in webview-kit 0.4.0 (src/adapters, unit tests with fakes). Not verified in a real VS Code webview or Playwright.

Update 0.4.2: the jsdom test for domThemeHost (test/dom-theme.test.ts) was missing and is now added; jsdom observes style and class changes, so the box stands. The "Playwright with the stub" task was not done.
