---
id: 135
title: Define the high-contrast dark and light palettes
type: feature
priority: P3
effort: S
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M8"
sprint: "VSS:SP52"
depends_on: [133]
created: 2026-10-25
---

High-contrast variants with the `hc` and `hcLight` base and the borders those bases require.

**Code:** `vsslicer/modules/apps/themes/src/domain/palettes/` (module: `themes`, layer: `domain`)

## Acceptance criteria

- [ ] `vsslicer-hc-dark.json` and `vsslicer-hc-light.json` are generated with `uiTheme` `hc-black` and `hc-light`
- [ ] Contrast borders are defined for focus, selection and widgets
- [ ] Both pass the contrast script (PLT-137) at AA

## Tasks

- [ ] Pick the colours
- [ ] Generate the themes

## Progress

Not started.
