---
id: 52
title: Show the Filament view as a native TreeView
type: feature
priority: P1
effort: M
model: sonnet
area: [ui]
story: US22
milestone: "VSS:M4"
depends_on: [51]
created: 2026-10-25
---

Activity-bar container with the TreeView over the view models; colour swatch icons; refresh on `onDidChange`.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `@vscode/test-electron` test: tree contents for each grouping on a fixture inventory
- [ ] Refresh after 2000 spools change stays under 100 ms (measured)
- [ ] Switching grouping and the archived filter persist across reload

## Tasks

- [ ] Write the provider
- [ ] Swatch icons
- [ ] Commands for grouping and filter
- [ ] Integration test

## Progress

Not started.
