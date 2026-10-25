---
id: 41
title: Implement the WebGL2 context factory with structured failure causes
type: feature
priority: P0
effort: M
model: sonnet
area: [webview-kit]
story: US9
milestone: "VSS:M1"
sprint: "VSS:SP4"
depends_on: [30, 17]
created: 2026-10-25
---

Create a WebGL2 context or return a structured error naming the cause: no WebGL2, creation refused after Chromium's SwiftShader removal, hardware acceleration disabled in `argv.json`.

## Acceptance criteria

- [ ] In Playwright, Chromium with WebGL disabled shows the kit's failure message with its cause; no blank canvas, no uncaught error
- [ ] Each cause has a unit test and a human-readable message
- [ ] Message includes the `argv.json` hint where relevant

## Tasks

- [ ] Define error types
- [ ] Detect causes
- [ ] Render the message element
- [ ] Test in Playwright

## Progress

Not started.
