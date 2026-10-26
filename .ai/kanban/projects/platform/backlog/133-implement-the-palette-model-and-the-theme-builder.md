---
id: 133
title: Implement the palette model and the theme builder
type: feature
priority: P3
effort: M
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [132]
created: 2026-10-25
---

A pure builder turns a palette (named roles) into the VS Code colour-theme JSON (workbench colours and token colours), so four themes share one mapping.

**Code:** `vsslicer/modules/themes/src/domain/` (module: `themes`, layer: `domain`)

## Acceptance criteria

- [ ] `buildTheme(palette)` returns valid theme JSON; unit tests check every required workbench key is present and no key is undefined
- [ ] Generated files under `themes/` are reproducible; CI fails if they differ from the builder output
- [ ] No VS Code API is used

## Tasks

- [ ] Define the palette roles
- [ ] Write the builder and tests
- [ ] Add the generate script

## Progress

Not started.
