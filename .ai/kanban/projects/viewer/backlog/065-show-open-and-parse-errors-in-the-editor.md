---
id: 65
title: Show open and parse errors in the editor
type: feature
priority: P0
effort: M
model: sonnet
area: [viewer]
story: US22
milestone: "VSS:M2"
sprint: "VSS:SP17"
depends_on: [53, 64]
created: 2026-10-25
---

A single error view for E8 and E9 errors, missing thumbnails and unsupported extension notices.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/errors/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each broken fixture from E8 and E9 shows its message in the editor, never a blank panel
- [ ] Notices (read-only extension, core-only dialect) appear without hiding the model

## Tasks

- [ ] Error view
- [ ] Fixture-driven tests

## Progress

Not started.
