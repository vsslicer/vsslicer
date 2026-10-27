---
id: 303
title: Resolve the filament palette for colour painting and flag painted indices with no filament
type: feature
priority: P2
effort: S
model: sonnet
area: [editor, painting]
story: US83
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [300]
created: 2026-10-25
---

The colour states are filament indices; this maps them to the project's filament list (name and colour) and reports a painted index that the filament list no longer has.

**Code:** `vsslicer/modules/apps/project/src/application/paint/palette.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] The palette of the Orca fixture lists its filaments with colours in order
- [ ] Removing a filament that a layer uses is reported with the object and the index
- [ ] No VS Code import

## Tasks

- [ ] Palette
- [ ] Missing-index check
- [ ] Tests

## Progress

Not started.
