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

- [ ] State round trip is typed; unit test against a fake `acquireVsCodeApi`
- [ ] Theme tokens update on a class/style change event (test in jsdom or Playwright)
- [ ] `acquireVsCodeApi` is called once only

## Tasks

- [ ] Write the wrapper and state helper
- [ ] Write theme token reader
- [ ] Test in Playwright with the stub

## Progress

Not started.
