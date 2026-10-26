---
id: 98
title: Add the browser entry and web manifest to the G-code extension
type: feature
priority: P2
effort: M
model: sonnet
area: [web]
story: US53
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [84, GCP-30, 90]
created: 2026-10-25
---

Adds a `browser` entry and `extensionKind` for workspace and web to `vsslicer.gcode`, activates the preview, the G-code language and the simulation view, and keeps the desktop `main` entry unchanged.

**Code:** `vsslicer/modules/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] The extension activates in `@vscode/test-web` and registers the custom editor and the language
- [ ] The Node-built-in check and the VSIX assertion pass for the browser bundle
- [ ] Desktop activation and tests are unchanged

## Tasks

- [ ] Entry file
- [ ] Manifest
- [ ] Activation test

## Progress

Not started.
