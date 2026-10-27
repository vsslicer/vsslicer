---
id: 415
title: "Show the current project in its view and the status bar, and export it"
type: feature
priority: P0
effort: M
model: sonnet
area: [editor]
story: US99
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [412, 414]
created: 2026-10-27
---

Wires `CurrentProjectService` into VS Code: the Current Project view at the top of the Projects container, a status bar item, the window's memory, and the extension's exported API that Printers and Profiles read (D23).

**Code:** `vsslicer/modules/apps/project/src/presentation/current-project/` and `src/presentation/extension.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The Current Project view shows the project name, kind and path, with Reveal in Explorer and Close project actions; empty, it shows the welcome content from VWR-412
- [ ] A left-aligned status bar item shows `$(package) <name>` (or "No project"); clicking it focuses the Projects container
- [ ] `CurrentProjectMemory` is backed by `context.workspaceState`, so each window keeps its own project across reloads
- [ ] `activate` returns `{ currentProject: CurrentProjectApi }`; the package exports the `CurrentProjectApi` and `ProjectRef` types for consumers (types only, from `@vsslicer/project-extension/api`)
- [ ] Integration test (`pnpm test:integration`): set a fixture project through the test hook, then the view's tree items, the status bar text and `extension.exports.currentProject.get()` all show it, and an `onDidChange` listener registered through the exports fires once
- [ ] Disposing the extension leaves no listener on the service (checked in the test)

## Tasks

- [ ] View provider and status bar item
- [ ] Memento memory and exports
- [ ] Integration test

## Progress

Not started.
