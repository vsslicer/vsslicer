---
id: 52
title: Implement the ProjectModel store
type: feature
priority: P0
effort: M
model: sonnet
area: [viewer]
story: US21
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [51, 74]
created: 2026-10-25
---

Read-only model of plates, objects and per-plate sliced artefacts with change events, built from `Project`.

**Code:** `vsslicer/modules/project-extension/src/application/projectModel.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Model matches the E8 golden JSON for each dialect
- [ ] Change events fire on reload
- [ ] No VS Code import (runs in plain Node)

## Tasks

- [ ] Model types
- [ ] Build from Project
- [ ] Events
- [ ] Tests

## Progress

Not started.
