---
id: 248
title: "Add the repair settings: load-time repair and merge tolerance"
type: feature
priority: P1
effort: S
model: sonnet
area: [repair]
story: US65
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [245, 246]
created: 2026-10-25
---

Contributes `vsslicer.project.repairOnLoad` (default on) and the merge tolerance setting with a conservative default.

**Code:** `vsslicer/modules/project-extension/src/presentation/settings/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Settings appear in the settings UI with descriptions
- [ ] Changing the tolerance changes the next repair and is shown in its report

## Tasks

- [ ] Contributions
- [ ] Wiring
- [ ] Test host test

## Progress

Not started.
