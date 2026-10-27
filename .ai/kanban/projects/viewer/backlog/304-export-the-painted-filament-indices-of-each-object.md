---
id: 304
title: Export the painted filament indices of each object
type: feature
priority: P2
effort: S
model: sonnet
area: [editor, painting]
story: US83
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [303, 63]
created: 2026-10-25
---

Adds a versioned export `paintedFilaments(objectId)` so the slicer UI can show which filaments an object's paint uses (multi-material assignment).

**Code:** `vsslicer/modules/apps/project/src/presentation/exports.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The export returns the sorted filament indices for a painted fixture object and an empty list otherwise
- [ ] The export type is versioned with the others

## Tasks

- [ ] Export
- [ ] Test

## Progress

Not started.
