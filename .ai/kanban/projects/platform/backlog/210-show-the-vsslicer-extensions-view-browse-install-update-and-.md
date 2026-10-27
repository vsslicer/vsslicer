---
id: 210
title: "Show the VSSlicer extensions view: browse, install, update and remove"
type: feature
priority: P0
effort: M
model: sonnet
area: [fork, registry]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP16"
depends_on: [209]
created: 2026-10-27
---

The VSSlicer extensions view (D23 step 2): a tree in its own activity-bar container that lists what our registry offers and what is installed, and installs through VS Code's own install command, so signature checks stay VS Code's.

**Code:** `vsslicer/modules/apps/workbench/src/presentation/extensions/` (module: `workbench-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Container `vsslicer-extensions` with Installed and Available groups and a search box (title action); items show name, version, update available
- [ ] Install, Update and Uninstall run `workbench.extensions.installExtension` / `uninstallExtension` with the downloaded VSIX or id; errors show with a retry
- [ ] No MCP servers and no recommendations appear
- [ ] Integration test (`pnpm test:integration`) with a stub catalogue: the tree lists the stub entries and Install calls the install command with the right argument

## Tasks

- [ ] Tree and actions
- [ ] Integration test

## Progress

Not started.
