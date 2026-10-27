---
id: 66
title: Add the export and reveal-parent commands
type: feature
priority: P0
effort: S
model: sonnet
area: [store, export]
story: US27
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [59, 144]
created: 2026-10-25
---

`Export to PrusaSlicer/Orca/Bambu/Cura` and `Reveal parent` from the tree.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/commands/export/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each export command writes a file that equals the `ProfileStore.export` output; overwriting asks first
- [ ] `Reveal parent` selects the parent in the tree; no parent shows a message

## Tasks

- [ ] Write the commands
- [ ] Integration test

## Progress

Not started.
