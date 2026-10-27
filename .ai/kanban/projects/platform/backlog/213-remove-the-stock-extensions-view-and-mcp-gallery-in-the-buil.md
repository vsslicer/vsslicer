---
id: 213
title: Remove the stock Extensions view and the MCP gallery from the VSSlicer build
type: feature
priority: P0
effort: S
model: sonnet
area: [fork]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP16"
depends_on: [218]
created: 2026-10-27
---

D23 step 2 and D24. The container (`vscode@07f806f:src/vs/workbench/contrib/extensions/browser/extensions.contribution.ts:115-130`) goes through PLT-218's list; the MCP views live in it (`src/vs/workbench/contrib/mcp/browser/mcpServersView.ts:534-560`) and go with it. The MCP gallery needs no patch: the overlay sets no `mcpGallery` (`src/vs/base/common/product.ts:166`) and `chat.mcp.gallery.serviceUrl` stays empty. Research: `docs/research/vscodium-build.md` §4, §5.

**Code:** `overlay/product.json` (`vsslicer.removedViewContainers`, no `extensionsGallery`, no `mcpGallery`) (repo: `vsslicer/vsslicer-build`, layer: n/a (config))

## Acceptance criteria

- [ ] `workbench.view.extensions` is in `vsslicer.removedViewContainers`; no Extensions container in the activity bar or the View menu; `Ctrl/Cmd+Shift+X` opens `vsslicer-extensions` (keybinding from `apps/workbench`)
- [ ] No MCP server view or MCP install entry anywhere; `product.json` has neither `mcpGallery` nor `extensionsGallery`
- [ ] "Extensions: Install from VSIX..." still works from the command palette
- [ ] The smoke test (PLT-160) checks the stock view is absent and the VSSlicer view opens

## Tasks

- [ ] Overlay entry
- [ ] Smoke check

## Progress

Not started.
