---
id: 212
title: Replace the stock Settings entry with the VSSlicer settings page in the build
type: feature
priority: P1
effort: S
model: opus
area: [fork]
story: US71
milestone: "VSS:M6"
depends_on: [149, 208]
created: 2026-10-27
---

D23 step 2: the Manage menu's Settings entry opens the VSSlicer settings page (PLT-208) instead of the stock editor; the stock editor stays reachable from the command palette for keys our schema doesn't cover.

**Code:** `vsslicer/modules/tooling/vsslicer-build/build/` (overlay and patches) (module: `vsslicer-build`, layer: `n/a (build)`)

## Acceptance criteria

- [ ] Manage > Settings and `Ctrl/Cmd+,` open `vsslicer.workbench.openSettings`; "Preferences: Open Settings (UI)" still opens the stock editor from the palette
- [ ] The method (keybinding and menu overrides, product.json, or a patch) is written in the card with `repo@commit:path:line`
- [ ] The smoke test (PLT-160) opens Settings and finds the VSSlicer page

## Tasks

- [ ] Menu and keybinding override
- [ ] Smoke test

## Progress

Not started.
