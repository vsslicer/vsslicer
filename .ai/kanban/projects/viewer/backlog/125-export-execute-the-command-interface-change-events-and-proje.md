---
id: 125
title: "Export execute, the Command interface, change events and ProjectModel.folder"
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US41
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [101, 122, 63]
created: 2026-10-25
---

Extends the extension exports with the editing API for other extensions.

**Code:** `vsslicer/modules/project-extension/src/presentation/exports.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A stub extension executes a command and receives the change event
- [ ] Exported types are versioned and an API report is checked in CI
- [ ] `folder` returns the `.vsslicer/` URIs

## Tasks

- [ ] Export surface
- [ ] API report
- [ ] Stub test

## Progress

Not started.
