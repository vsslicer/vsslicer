---
id: 52
title: Show the Filament view as a native TreeView
type: feature
priority: P0
effort: M
model: sonnet
area: [ui]
story: US22
milestone: "VSS:M4"
sprint: "VSS:SP14"
depends_on: [51]
created: 2026-10-25
---

The TreeView over the view models in the `vsslicer-filaments` container (added by FIL-99, E70); colour swatch icons; refresh on `onDidChange`.

**Code:** `vsslicer/modules/apps/filament/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `@vscode/test-electron` test: tree contents for the brand and location groupings on a fixture inventory (in-memory store)
- [ ] Refresh after 2000 spools change stays under 100 ms (measured)
- [ ] Switching grouping and the archived filter persist across reload

## Tasks

- [ ] Write the provider
- [ ] Swatch icons
- [ ] Commands for grouping and filter
- [ ] Integration test

## Progress

Not started.
