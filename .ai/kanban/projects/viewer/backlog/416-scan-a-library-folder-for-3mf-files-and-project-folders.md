---
id: 416
title: Scan a library folder for .3mf files and project folders
type: feature
priority: P0
effort: M
model: sonnet
area: [editor]
story: US99
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [413]
created: 2026-10-27
---

The Projects library use cases: list what is in the library folder, merge it with the recent list, and create a new project folder. Untrusted input is a directory tree, so the bounds are named here (estimation rule 25).

**Code:** `vsslicer/modules/apps/project/src/application/library.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] `listLibrary(root)` over a `LibraryFolder` port (`readDir(uri) => {name, isDir}[]`) returns `ProjectRef`s for `.3mf` files and project folders (per VWR-413) at the root and one level down; it skips dot-folders and `node_modules`, stops at 2000 entries and reports that it stopped
- [ ] `recent(entries, memory)` merges the scan with the recent list from a `RecentProjects` port; a recent project outside the library still shows; a missing one is dropped
- [ ] `newProject(root, name)` validates the name (no path separators, not empty, not taken) and creates `<root>/<name>/` through the port; it returns the new `ProjectRef` (a folder project; writing a blank `.3mf` is out of scope)
- [ ] Unit tests in plain Node with an in-memory `LibraryFolder`, including the 2000-entry cap and a name collision

## Tasks

- [ ] Ports and use cases
- [ ] Unit tests

## Progress

Not started.
