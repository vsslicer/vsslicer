---
id: 40
title: "Integration test: webview hide, restore, dispose and CSP console capture"
type: feature
priority: P1
effort: M
model: sonnet
area: [webview-kit]
story: US8
milestone: "VSS:M1"
depends_on: [36, 37, 15]
created: 2026-10-25
---

Lifecycle and CSP checks in the sample webview editor.

## Acceptance criteria

- [ ] Hide and re-show restores state set with `setState`
- [ ] Dispose mid-transfer logs one warning and leaks no listener
- [ ] Console log capture shows no CSP violation

## Tasks

- [ ] Write the lifecycle test
- [ ] Capture the webview console
- [ ] Assert no CSP messages

## Progress

Not started.
