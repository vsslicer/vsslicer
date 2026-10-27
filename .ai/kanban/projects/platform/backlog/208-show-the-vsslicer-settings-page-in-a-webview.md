---
id: 208
title: Show the VSSlicer settings page in a webview
type: feature
priority: P1
effort: L
model: sonnet
area: [fork, webview-kit]
story: US71
milestone: "VSS:M6"
depends_on: [207]
created: 2026-10-27
---

The settings page itself: a webview built with `@vsslicer/webview-kit` that renders the settings model and writes values through `workspace.getConfiguration().update`.

**Code:** `vsslicer/modules/apps/workbench/src/presentation/settings/` (module: `workbench-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Command `vsslicer.workbench.openSettings` opens one page (a second run reveals it); sections per extension, a search box, User and Workspace tabs
- [ ] Editing a field validates in the page and writes the value at the chosen scope; an external change to `settings.json` updates the page
- [ ] The page follows the theme through webview-kit's theme tokens and passes its CSP helper
- [ ] Integration test (`pnpm test:integration`): opening the page and posting a field change updates `getConfiguration()`; an invalid value is refused and nothing is written

## Tasks

- [ ] Webview and messages
- [ ] Field controls and search
- [ ] Integration test

## Progress

Not started.
