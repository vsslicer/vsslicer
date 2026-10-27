---
id: 111
title: Show the save notice for removed stale artefacts and interop limits
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US36
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [109]
created: 2026-10-25
---

After a save, a notification lists the plate artefacts removed and any known interop limit (for example, a second printer lost in Orca).

**Code:** `vsslicer/modules/apps/project/src/presentation/editor/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Saving an edited sliced fixture lists the removed parts by name
- [ ] No notice when nothing was removed
- [ ] Notices are dismissible and do not block saving

## Tasks

- [ ] Notice formatting
- [ ] Notification
- [ ] Test

## Progress

Not started.
