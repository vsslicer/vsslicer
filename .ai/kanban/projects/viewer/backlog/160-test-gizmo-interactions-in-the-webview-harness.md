---
id: 160
title: Test gizmo interactions in the webview harness
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP19"
depends_on: [154, 155, PLT-17, PLT-38]
created: 2026-10-25
---

Playwright tests on the kit's webview stub: drag, snap, numeric entry and Escape.

**Code:** `vsslicer/modules/project-extension/test/webview/gizmo/` (module: `project-extension`, layer: n/a (tests))

## Acceptance criteria

- [ ] Drag sends one command; snap sends a snapped value; numeric entry sends the typed value
- [ ] Escape sends none
- [ ] Runs in CI on Linux

## Tasks

- [ ] Scenarios
- [ ] CI job

## Progress

Not started.
