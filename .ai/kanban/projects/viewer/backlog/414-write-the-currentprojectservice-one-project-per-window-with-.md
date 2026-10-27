---
id: 414
title: "Write the CurrentProjectService: one project per window with change events"
type: feature
priority: P0
effort: M
model: opus
area: [editor]
story: US99
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [413]
created: 2026-10-27
---

The contract other apps build on (D23: Printers and Profiles read the current project through `vsslicer.project`'s API, never through files), so it is Opus and M (estimation rule 8).

**Code:** `vsslicer/modules/apps/project/src/application/current-project-service.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] `CurrentProjectService` holds at most one `ProjectRef`; `get()`, `set(ref)`, `clear()` and `onDidChange(listener) => dispose` (a plain listener set, no VS Code `EventEmitter` here); setting the same project again fires nothing
- [ ] A `CurrentProjectMemory` port (`load(): ProjectRef | undefined`, `save(ref | undefined)`) restores the window's project on start; a stored project whose file or folder no longer exists is dropped through an `exists` port and reported once
- [ ] A listener that throws doesn't stop the others and doesn't undo the change
- [ ] The public type `CurrentProjectApi` (`get`, `onDidChange`) is what `activate` will export; it has no setter, so only the Projects view switches projects
- [ ] Unit tests in plain Node with in-memory port fakes

## Tasks

- [ ] Service and ports
- [ ] Unit tests

## Progress

Not started.
