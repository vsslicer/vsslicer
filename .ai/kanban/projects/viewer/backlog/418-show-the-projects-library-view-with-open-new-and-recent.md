---
id: 418
title: "Show the Projects library view with open, new and recent"
type: feature
priority: P0
effort: M
model: sonnet
area: [editor]
story: US99
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [415, 417]
created: 2026-10-27
---

The Projects view under Current Project (D23): the library list with Open, New project and a Recent group. Opening a project makes it the window's current project; it doesn't open a new window.

**Code:** `vsslicer/modules/apps/project/src/presentation/library/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Setting `vsslicer.project.libraryFolder` (path, default empty) and a "Set library folder" command with a folder picker; the view refreshes when the setting changes and on a Refresh action
- [ ] The view lists a Recent group (from `context.globalState`) and the library projects; each item has Open; the title bar has New project and Refresh
- [ ] Open sets the current project (status bar and Current Project view update) and adds it to Recent; a `.3mf` also opens in its editor when one is registered for it; the window is not reloaded and no new window opens
- [ ] New project asks for a name, creates the folder through VWR-416 and opens it
- [ ] Integration test (`pnpm test:integration`) on a fixture library folder: the tree lists the fixture projects; running Open on one changes `exports.currentProject.get()` and the status bar text

## Tasks

- [ ] Setting and commands
- [ ] Tree provider
- [ ] Integration test

## Progress

Not started.
