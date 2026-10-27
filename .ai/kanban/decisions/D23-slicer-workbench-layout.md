---
id: D23
title: "The slicer workbench: one sidebar container per area, a current project, and stock chrome hidden"
status: accepted
date: 2026-10-27
---

## Context

Owner review of the sandbox (2026-10-27): the stock VS Code chrome (Accounts, the Manage/Settings
gear, Extensions, Run and Debug, Source Control) is visible, and there is no slicer home: no
project list, no printers, filaments or profiles screen in the sidebar, and nothing that holds
"the project I'm working on". The owner put these first, ahead of the remaining M2–M3 depth.

## Decision (proposed)

**Layout.** The Explorer stays for plain files. Each area gets its own activity-bar container,
contributed by the app that owns it, in this order:

| Container | App | Views |
|---|---|---|
| Projects | `apps/project` | Current Project (top), Projects (library list: open, new, recent) |
| Printers | `apps/printers` | Printers (status, add, remove); mocked providers until real adapters land |
| Filaments | `apps/filament` (new) | Spools and materials |
| Profiles | `apps/profiles` | Profile tree (printer, toolhead, nozzle, material, intent: D22) |

**Current project.** One project per window, held by `apps/project`. It shows in the status bar
and at the top of the Projects container. Other apps read it and watch for changes through
`apps/project`'s extension API (`extensionDependencies`), never through files. Switching project
from the Projects list re-scopes the window and doesn't open a new one.

**Mocked printers.** `printer/mock` is a printer adapter (printer-api) that simulates printers:
discovery, status, progress, errors. The Printers view and the Add printer flow are built against
it, so they work before any network adapter does.

**Hiding the stock chrome.** It happens in two steps, because stock VS Code doesn't let an
extension remove workbench parts:

1. Now: a `VSSlicer` profile (`.code-profile`, also applied by `scripts/sandbox.mjs`). Its UI state
   unpins and hides Accounts, Source Control, Run and Debug and Extensions, and its settings turn
   off git, AI features and recommendations. The user can still reach them through the command
   palette.
2. The VSSlicer build (E69): `product.json` and patches remove Accounts, the Manage menu's stock
   Settings entry and the Extensions view. Our replacements take their place: a VSSlicer settings
   page (a webview generated from our schema) and a VSSlicer extensions view that lists only our
   registry (E68), with no MCP servers.

## Alternatives

- One "VSSlicer" container with every view stacked: one icon, but a long sidebar, and Printers and
  Filaments compete for height.
- Projects inside the Explorer: no new icon, but the file tree and the project list fight for the
  same space; the owner wants file browsing kept.

## Consequences

- New: `printer/mock`, `apps/filament`, the project library and current-project service in
  `apps/project`, the VSSlicer profile, a settings page and extensions view (build only).
- Existing cards move forward: Printers tree (PRN-20), manual Add printer (PRN-21) and their
  dependencies; filament module and entities (FIL-1, FIL-2) and Filament view (FIL-51, FIL-52);
  profile tree (PRF-61), retargeted from the Explorer to the Profiles container.
