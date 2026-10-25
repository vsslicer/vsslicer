---
id: US54
title: "Open a 3MF or STL on vscode.dev"
status: reviewed
epic: VSS:E48
---

As someone who shares models in a repository, I want the model viewer to work in the browser, so that I can inspect a `.3mf` or `.stl` without a desktop install.

## Acceptance criteria

- [ ] `vsslicer.project` in viewer mode has a `browser` entry and opens `.3mf`, `.stl` and `.obj` from the I2 fixture corpus through `vscode.workspace.fs` only
- [ ] A file over the stated web size limit shows the message and opens nothing
- [ ] Editing commands (I6) are not contributed on the web
- [ ] The `@vscode/test-web` tests of the viewer run in CI on every pull request that touches its browser path

## Out of scope

- Project editing, arrange, mesh repair and STEP import on the web.
