---
id: 103
title: Add the browser entry and viewer-only manifest to the project extension
type: feature
priority: P2
effort: M
model: sonnet
area: [web]
story: US54
milestone: "VSS:M5"
sprint: "VSS:SP33"
depends_on: [84, VWR-54, 95, 97]
created: 2026-10-25
---

Adds a `browser` entry for viewer mode: the read-only custom editor for 3MF, STL and OBJ, with editing, repair, STEP and arrange contributions not registered on the web.

**Code:** `vsslicer/modules/project-extension/src/presentation/...` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The extension activates in `@vscode/test-web` and registers the viewer only; editing commands are not contributed when `isWeb`
- [ ] The Node-built-in check and the VSIX assertion pass for the browser bundle
- [ ] Desktop activation and tests are unchanged

## Tasks

- [ ] Entry file
- [ ] Manifest split
- [ ] Activation test

## Progress

Not started.
