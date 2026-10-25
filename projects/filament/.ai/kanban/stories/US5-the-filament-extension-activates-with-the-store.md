---
id: US5
title: "The Filament extension activates with the store in my user storage"
status: reviewed
epic: VSS:E40
---

As a user, I want `vsslicer.filament` to open my inventory from the user-level storage with an output channel and warnings, so that spools are shared by every window and problems are visible.

## Acceptance criteria

- [ ] The extension activates in an `@vscode/test-electron` run and exports `Inventory`
- [ ] The store lives in `globalStorageUri`; `extensionKind` is `["ui", "workspace"]`
- [ ] A corrupt line, a missing density and a lock timeout each show a warning and an output-channel entry
- [ ] Settings for the store location are not offered (user storage only)

## Out of scope

- Views and commands beyond activation (E43)
