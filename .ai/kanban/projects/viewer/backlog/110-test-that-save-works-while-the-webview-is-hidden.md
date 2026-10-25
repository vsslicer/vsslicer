---
id: 110
title: Test that save works while the webview is hidden
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US36
milestone: "VSS:M4"
sprint: "VSS:SP18"
depends_on: [109, PLT-15]
created: 2026-10-25
---

A test-host test: edit, hide the editor, run Save, check the file.

**Code:** `vsslicer/modules/project-extension/test/integration/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The file on disk contains the edit when saved with the panel hidden
- [ ] Runs in the integration matrix

## Tasks

- [ ] Test

## Progress

Not started.
