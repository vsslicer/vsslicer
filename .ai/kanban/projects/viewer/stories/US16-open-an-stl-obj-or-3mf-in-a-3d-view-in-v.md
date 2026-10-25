---
id: US16
title: "Open an STL, OBJ or 3MF in a 3D view in VS Code"
status: reviewed
epic: VSS:E10
---

As a VS Code user, I want to double-click a `.3mf`, `.stl` or `.obj` and see it rendered in a WebGL2 view, so that I can inspect models without leaving the editor.

## Acceptance criteria

- [ ] A `CustomReadonlyEditorProvider` handles `*.3mf`, `*.stl` and `*.obj`; the host holds the `Project`, the webview fetches bytes through `asWebviewUri` and parses meshes in its workers
- [ ] The webview renders the meshes with three.js `WebGLRenderer` (WebGL2 only, D6) built on the E2 kit for transport and CSP
- [ ] Fixture projects from each dialect open and render; snapshot tests in headless Chromium with software WebGL match reference images within a pixel tolerance
- [ ] Disabling the extension restores VS Code's default binary editor
- [ ] Verified only on fixtures (D5)

## Out of scope

- Editing, saving and undo (E32)
- Web build (I10)
