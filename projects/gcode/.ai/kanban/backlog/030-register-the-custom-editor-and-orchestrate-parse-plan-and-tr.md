---
id: 30
title: "Register the custom editor and orchestrate parse, plan and transfer"
type: feature
priority: P0
effort: L
model: opus
area: [editor]
story: US10
milestone: "VSS:M1"
depends_on: [6, 19]
created: 2026-10-25
---

`CustomReadonlyEditorProvider` for the three types with `supportsMultipleEditorsPerDocument` false. Needs PLT:E2 webview-kit (transport, CSP helper, WebGL2 core) from the platform worker.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Opens a fixture from each of the five slicers with no other extension installed (`@vscode/test-electron`)
- [ ] Text never becomes a `TextDocument` (test asserts it)
- [ ] Buffers reach the webview as ArrayBuffers; `retainContextWhenHidden` is on; state saved via `setState`
- [ ] `*.bgcode` and `*.gcode.3mf` are `default`, `*.gcode` is `option` behind a setting

## Tasks

- [ ] Provider and document model
- [ ] Worker orchestration
- [ ] Transfer through webview-kit
- [ ] Registration and setting
- [ ] Test

## Progress

Not started.
