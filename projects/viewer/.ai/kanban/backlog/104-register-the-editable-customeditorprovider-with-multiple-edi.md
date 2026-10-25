---
id: 104
title: Register the editable CustomEditorProvider with multiple editors per document
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US35
milestone: "VSS:M4"
depends_on: [54, 101]
created: 2026-10-25
---

Replaces the readonly provider with a `CustomEditorProvider` behind the editing setting, one document per file with `supportsMultipleEditorsPerDocument`.

**Code:** `vsslicer/modules/project-extension/src/presentation/editor/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Opening a 3MF fixture shows the editor and a split view shares one document
- [ ] With the setting off the readonly provider is used
- [ ] The test host opens an STL and an OBJ without error

## Tasks

- [ ] Provider
- [ ] Document class
- [ ] Integration test

## Progress

Not started.
