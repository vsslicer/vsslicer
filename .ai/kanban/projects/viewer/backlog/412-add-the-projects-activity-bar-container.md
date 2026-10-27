---
id: 412
title: Add the Projects activity-bar container
type: feature
priority: P0
effort: S
model: sonnet
area: [editor]
story: US99
milestone: "VSS:M3"
sprint: "VSS:SP14"
created: 2026-10-27
---

The first VSSlicer container in the activity bar (D23): `vsslicer-projects`, contributed by `vsslicer.project`, holding the Current Project view (top) and the Projects view. This card adds the container and the two empty views with welcome content; later cards fill them.

**Code:** `vsslicer/modules/apps/project/package.json`, `vsslicer/modules/apps/project/media/`, `vsslicer/modules/apps/project/src/presentation/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `contributes.viewsContainers.activitybar` has `vsslicer-projects` (title "Projects", an icon in `media/`) and `contributes.views` puts `vsslicer.project.current` above `vsslicer.project.library` in it
- [ ] Each view shows welcome content while empty ("No current project" with an Open project button; "Set a library folder" with a button that opens the setting)
- [ ] The extension activates on `onView:vsslicer.project.current` and `onView:vsslicer.project.library`, not on `*`
- [ ] Integration test (`pnpm test:integration`, `@vsslicer/test-vscode`): after activation both view ids are registered and `workbench.view.extension.vsslicer-projects` opens the container
- [ ] The VSIX passes the content assertion

## Tasks

- [ ] Contributions and icon
- [ ] Welcome content
- [ ] Integration test

## Progress

Not started.
