---
id: US24
title: "Slice, preview and print from commands and the status bar"
status: reviewed
epic: VSS:E29
---

As a user, I want 'Slice plate', 'Slice and preview' and 'Slice and print' commands with progress in the status bar, so that I can run the loop without writing tasks.

## Acceptance criteria

- [ ] Commands exist for slice, slice and preview (opens the result with `GcodePreview.open`) and slice and print
- [ ] Progress shows through `withProgress` in the status bar and is cancellable
- [ ] Failures show one notification naming the step

## Out of scope

- Keybindings beyond defaults
