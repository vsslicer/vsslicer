---
id: 74
title: Build the webview shell with group navigation and hidden-key toggle
type: feature
priority: P0
effort: M
model: sonnet
area: [form]
story: US29
milestone: "VSS:M2"
sprint: "VSS:SP17"
depends_on: [73, PLT-37, PLT-38]
created: 2026-10-25
---

The webview app: pages per schema group from the model, subgroup order, a hidden-keys toggle and 'modified only' and 'differs from parent' filters; VS Code theme tokens.

**Code:** `vsslicer/modules/profiles-extension/webview/shell/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Every one of the 14 FFF groups renders as a page from the model; navigation by keyboard works
- [ ] Hidden keys appear only when the toggle is on; the filters change the visible fields (Playwright with the kit stub)
- [ ] Theme colours come from VS Code tokens, none hard-coded (lint check)

## Tasks

- [ ] Write the shell and navigation
- [ ] Filters and toggle
- [ ] Playwright tests

## Progress

Not started.
