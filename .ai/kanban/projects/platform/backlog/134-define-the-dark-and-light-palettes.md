---
id: 134
title: Define the dark and light palettes
type: feature
priority: P3
effort: S
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [133]
created: 2026-10-25
---

Two colour palettes that make the generated dark and light themes.

**Code:** `vsslicer/modules/themes/src/domain/palettes/` (module: `themes`, layer: `domain`)

## Acceptance criteria

- [ ] Dark and light palettes exist and generate `vsslicer-dark.json` and `vsslicer-light.json`
- [ ] Palette includes the colours the G-code preview and model viewer read through the webview theme tokens
- [ ] Both pass the contrast script once it exists (PLT-137)

## Tasks

- [ ] Pick the colours
- [ ] Generate the themes

## Progress

Not started.
