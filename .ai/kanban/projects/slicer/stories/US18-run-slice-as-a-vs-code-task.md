---
id: US18
title: "Run slice as a VS Code task"
status: reviewed
epic: VSS:E29
---

As a user, I want a `vsslicer` task type with `slice` that I can put in `tasks.json` and chain with `dependsOn`, so that slicing is part of my build workflow.

## Acceptance criteria

- [ ] `registerTaskProvider` for type `vsslicer` resolves `slice` (engine, plate, profile triple) from `tasks.json`; the definition schema is exported
- [ ] A `CustomExecution` pseudoterminal streams engine progress lines
- [ ] `dependsOn` chains run in order and a failed `slice` stops later tasks (`@vscode/test-electron`)
- [ ] A spike records whether pseudoterminal output feeds problem matchers in all supported VS Code versions; fallback is a `ShellExecution` wrapper around a small Node CLI

## Out of scope

- Fleet send (PRN, I9)
