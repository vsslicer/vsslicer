---
id: 63
title: Export ProjectModel and renderThumbnail
type: feature
priority: P1
effort: M
model: sonnet
area: [viewer]
story: US21
milestone: "VSS:M2"
sprint: "VSS:SP26"
depends_on: [52, 55]
created: 2026-10-25
---

Extension `exports` with ProjectModel and `renderThumbnail(plate)` rendering offscreen in the webview.

**Code:** `vsslicer/modules/apps/project/src/presentation/exports.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `renderThumbnail(plate)` returns PNG bytes of the expected size on the Bambu fixture
- [ ] Exported types are versioned

## Tasks

- [ ] Exports
- [ ] Offscreen render
- [ ] Test

## Progress

Not started.
