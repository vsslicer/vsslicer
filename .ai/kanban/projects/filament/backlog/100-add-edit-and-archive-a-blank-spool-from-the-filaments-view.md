---
id: 100
title: "Add, edit and archive a blank spool from the Filaments view"
type: feature
priority: P0
effort: M
model: sonnet
area: [ui]
story: US39
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [52]
created: 2026-10-27
---

E70's "a spool can be added, edited and archived in the Filaments view (in-memory store)". Plain input boxes and quick picks over the FIL-5 use cases. Adding from the catalogue (FIL-53), the spool editor form (FIL-54) and its webview (FIL-55) come later and replace these prompts.

**Code:** `vsslicer/modules/apps/filament/src/presentation/commands/` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Add spool (view title and welcome button): pick or type brand, material and colour, enter initial and empty-spool weight and location; the spool appears in the tree
- [ ] Edit spool (item context menu): change weights, location and colour; validation errors from the entities (FIL-2) show as input-box messages, nothing is saved on error
- [ ] Archive and Restore (item context menu) round trip; archived spools hide unless the archived filter is on
- [ ] Integration test (`pnpm test:integration`) runs add, edit and archive through the commands with stubbed prompts and checks the tree items after each

## Tasks

- [ ] Commands and menus
- [ ] Integration test

## Progress

Not started.
