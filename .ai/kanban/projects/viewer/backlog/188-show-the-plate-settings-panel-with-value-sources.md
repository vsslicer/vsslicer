---
id: 188
title: Show the plate settings panel with value sources
type: feature
priority: P1
effort: M
model: sonnet
area: [plates]
story: US52
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [176, 179, 158]
created: 2026-10-25
---

A panel for the active plate: bed type, print sequence, spiral mode, filament order and maps, with the source of each value from the layering.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/plates/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each control sends its command and the source badge updates
- [ ] An invalid filament map is refused inline

## Tasks

- [ ] Panel
- [ ] Source badges
- [ ] Test

## Progress

Not started.
