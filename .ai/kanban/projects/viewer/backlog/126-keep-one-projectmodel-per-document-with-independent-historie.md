---
id: 126
title: Keep one ProjectModel per document with independent histories
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US40
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [101]
created: 2026-10-25
---

A registry keyed by document URI that creates, finds and disposes models; histories never share state.

**Code:** `vsslicer/modules/project-extension/src/application/registry.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Execute and undo on model A never changes model B
- [ ] Disposing a document frees its model

## Tasks

- [ ] Registry
- [ ] Tests

## Progress

Not started.
