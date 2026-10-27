---
id: 54
title: "Register the readonly custom editor for 3MF, STL and OBJ"
type: feature
priority: P0
effort: M
model: sonnet
area: [viewer]
story: US16
milestone: "VSS:M2"
sprint: "VSS:SP21"
depends_on: [53, PLT-32, PLT-36]
created: 2026-10-25
---

The `CustomReadonlyEditorProvider` that serves the webview HTML with the kit's CSP and file bytes through `asWebviewUri`.

**Code:** `vsslicer/modules/apps/project/src/presentation/editor/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Opening each fixture type shows the webview
- [ ] Webview URIs only for the file's folder; CSP from the kit
- [ ] Disabling the extension falls back to the default editor (documented)

## Tasks

- [ ] Provider
- [ ] Webview HTML
- [ ] Byte serving
- [ ] Integration test

## Progress

Not started.
