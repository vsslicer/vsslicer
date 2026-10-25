---
id: 105
title: Add the vsslicer.project.editing setting and the switch back to read-only
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP18"
depends_on: [104]
created: 2026-10-25
---

The setting turns editing on or off; switching off asks to save a dirty project first.

**Code:** `vsslicer/modules/project-extension/src/presentation/settings/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Default is on
- [ ] Switching off with unsaved edits asks to save, discard or cancel; cancel keeps the setting on
- [ ] Switching off with a clean project reopens it read-only without a prompt

## Tasks

- [ ] Setting contribution
- [ ] Prompt
- [ ] Test host test

## Progress

Not started.
