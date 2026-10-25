---
id: 36
title: Implement the host half of the transport with dropped-message handling
type: feature
priority: P0
effort: M
model: sonnet
area: [webview-kit]
story: US8
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [35, 32]
created: 2026-10-25
---

Binds the channel to a VS Code `Webview` using `SerializableObjectWithBuffers`; messages to a disposed webview are dropped with one logged warning, not an exception.

## Acceptance criteria

- [x] Disposing the webview mid-transfer logs exactly one warning and leaks no listener (unit test with a fake webview)
- [x] Host never parses payloads beyond the envelope
- [x] Reload of the webview triggers a new handshake

## Tasks

- [x] Write the host binding
- [x] Track disposal
- [x] Write unit tests with a fake Webview

## Progress

Done in webview-kit 0.4.0 (src/adapters, unit tests with fakes). Not verified in a real VS Code webview or Playwright.
