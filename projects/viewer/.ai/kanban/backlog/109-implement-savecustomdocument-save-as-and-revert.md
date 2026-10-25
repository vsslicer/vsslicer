---
id: 109
title: "Implement saveCustomDocument, Save As and revert"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US36
milestone: "VSS:M4"
depends_on: [108, 106]
created: 2026-10-25
---

Wires `saveCustomDocument`, `saveCustomDocumentAs` and `revertCustomDocument` to the use case and the history.

**Code:** `vsslicer/modules/project-extension/src/presentation/editor/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Save writes the file and clears dirty; Save As writes a new file and switches the document
- [ ] Revert reloads the saved file and drops the history
- [ ] Errors show a message with the cause

## Tasks

- [ ] Three handlers
- [ ] Messages
- [ ] Test host tests

## Progress

Not started.
