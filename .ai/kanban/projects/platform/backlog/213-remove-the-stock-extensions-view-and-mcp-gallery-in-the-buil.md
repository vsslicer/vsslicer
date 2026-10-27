---
id: 213
title: Remove the stock Extensions view and MCP gallery in the build
type: feature
priority: P1
effort: S
model: opus
area: [fork]
story: US71
milestone: "VSS:M6"
depends_on: [149, 210]
created: 2026-10-27
---

D23 step 2: the build shows the VSSlicer extensions view (PLT-210) and not the stock Extensions view or its MCP server gallery.

**Code:** `vsslicer/modules/tooling/vsslicer-build/build/` (overlay and patches) (module: `vsslicer-build`, layer: `n/a (build)`)

## Acceptance criteria

- [ ] No `workbench.view.extensions` container in the activity bar or the View menu; `Ctrl/Cmd+Shift+X` opens `vsslicer-extensions`
- [ ] No MCP server gallery or MCP install entry anywhere (product.json `mcpGallery` unset or the equivalent), checked against the pinned VS Code source with `repo@commit:path:line`
- [ ] Installing a VSIX from file still works from the command palette
- [ ] The smoke test (PLT-160) checks the stock view is absent and the VSSlicer view opens

## Tasks

- [ ] Overlay or patch
- [ ] Smoke test

## Progress

Not started.
