---
id: 77
title: Wire tray reports to tag matching and add the settings and prompts
type: feature
priority: P2
effort: M
model: sonnet
area: [tags, ui]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [47, 76]
created: 2026-10-25
---

Feed registry status to the tray handler; setting `filament.tags.autoCreate` (ask, always, never; default ask); a prompt for a new tagged spool; a warning for a cloned tag.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] An integration test with the fake adapter's tray report: ask shows the prompt, always creates, never creates nothing
- [ ] A cloned tag shows a warning and merges nothing

## Tasks

- [ ] Registry wiring
- [ ] Setting and prompt
- [ ] Integration test

## Progress

Not started.
