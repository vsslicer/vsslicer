---
id: E70
title: Give VSSlicer a slicer workbench: project, printer, filament and profile sidebars and hidden stock chrome
status: draft
initiative: I1
project: PLT
order: 0
depends_on: []
rows: []
---

Owner priority (2026-10-27): before more depth, the editor has to look and work like a slicer.
Layout and staging are in D23.

## Scope

- **In:**
  - The VSSlicer profile, which hides Accounts, Source Control, Run and Debug and Extensions and
    turns off git, AI and recommendations; `scripts/sandbox.mjs` applies it (PLT).
  - Projects container: the Current Project view and status bar item, and the Projects library
    list with open, new and recent (VWR, `apps/project`).
  - Printers container: the `printer/mock` adapter, the Printers tree, and Add printer against the
    mock providers (PRN).
  - Filaments container: the `filament` module's entities and an in-memory store first, then
    `apps/filament` with the Filaments view (FIL).
  - Profiles container: the profile tree moved out of the Explorer (PRF).
- **Later, in the build (E69):** remove Accounts, the stock Settings entry and the Extensions
  view; add the VSSlicer settings page and the VSSlicer extensions view (our registry only, no MCP).
- **Out:** custom account setup (a later epic, once there is something to sign in to).

## Acceptance criteria

- [ ] `node scripts/sandbox.mjs` opens with Projects, Printers, Filaments, Profiles and Explorer
  in the activity bar, and none of Accounts, Source Control, Run and Debug or Extensions.
- [ ] Opening a project from the Projects list makes it the current project. The status bar and
  the Current Project view show it, and the Printers and Profiles views read it.
- [ ] Add printer with a mock provider adds a printer that shows simulated status and progress.
- [ ] A spool can be added, edited and archived in the Filaments view (in-memory store).
- [ ] Each view has an integration test in `test-vscode`.
