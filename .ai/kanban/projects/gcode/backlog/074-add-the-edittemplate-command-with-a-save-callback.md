---
id: 74
title: Add the editTemplate command with a save callback
type: feature
priority: P2
effort: M
model: sonnet
area: [language]
story: US45
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [72]
created: 2026-10-25
---

`vsslicer.gcode.editTemplate({slicer, kind, text, title, saveCommand})` opens an in-memory template document; on save it executes `saveCommand.id` with `saveCommand.args` plus the text. Arguments and results are serialisable so a UI-side extension can call it from another host.

**Code:** `vsslicer/modules/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] Opening shows the text in a `gcode-template` editor with the given slicer and kind; saving calls the save command with the edited text exactly once per save
- [ ] Closing without saving calls nothing; calling with a missing `saveCommand` opens a read-only view
- [ ] The command and its argument type are exported and versioned

## Tasks

- [ ] Virtual document
- [ ] Command
- [ ] Tests

## Progress

Not started.
