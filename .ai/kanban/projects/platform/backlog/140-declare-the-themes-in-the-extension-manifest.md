---
id: 140
title: Declare the themes in the extension manifest
type: feature
priority: P3
effort: XS
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [134, 135, 139]
created: 2026-10-25
---

The `contributes` section: four colour themes with `uiTheme` values, the icon theme, and the marketplace metadata.

**Code:** `vsslicer/modules/apps/themes/package.json` (module: `themes`, layer: `presentation`)

## Acceptance criteria

- [ ] The manifest lists exactly the generated theme files and icon theme; a test asserts each path exists
- [ ] The VSIX content assertion passes and the VSIX is within the size budget
- [ ] Licence, categories (`Themes`) and keywords are set

## Tasks

- [ ] Write the manifest
- [ ] Add the manifest test

## Progress

Not started.
