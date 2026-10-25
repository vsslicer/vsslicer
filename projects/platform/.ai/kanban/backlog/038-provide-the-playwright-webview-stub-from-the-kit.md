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
depends_on: [37, 17]
created: 2026-10-25
---

Fake `acquireVsCodeApi` and a fake host end of the transport so every project can snapshot its webview in plain Chromium.

## Acceptance criteria

- [ ] The sample webview exchanges a typed message with the fake host in Playwright
- [ ] Stub exported as `@vsslicer/webview-kit/testing`; documented with an example
- [ ] Harness loader from E1 uses it instead of its own stub

## Tasks

- [ ] Write the stub and fake host
- [ ] Replace the harness stub
- [ ] Document

## Progress

Not started.
