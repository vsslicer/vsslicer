---
id: 121
title: Test the backup size for a 100 MB project after 50 transform edits
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US37
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [117]
created: 2026-10-25
---

Generates a 100 MB project, runs 50 transform edits and measures the backup file.

**Code:** `vsslicer/modules/apps/project/test/integration/` (module: `project-extension`, layer: n/a (tests))

## Acceptance criteria

- [ ] Backup is under 1 MB
- [ ] The test fails when a mesh is written into the backup (meta-check)

## Tasks

- [ ] Generator
- [ ] Measure

## Progress

Not started.
