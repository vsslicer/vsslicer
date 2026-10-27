---
id: 114
title: Watch the file and ask reload or keep
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US38
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [113, 104, PLT-15]
created: 2026-10-25
---

A file watcher for the document and the prompt from the decision.

**Code:** `vsslicer/modules/apps/project/src/presentation/editor/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Changing a dirty fixture on disk shows the prompt in the test host; neither answer loses edits
- [ ] Reload of a clean document is silent

## Tasks

- [ ] Watcher
- [ ] Prompt
- [ ] Test host test

## Progress

Not started.
