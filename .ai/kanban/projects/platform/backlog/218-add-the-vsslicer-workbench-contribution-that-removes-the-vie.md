---
id: 218
title: Add the VSSlicer workbench contribution that removes the view containers product.json lists
type: feature
priority: P0
effort: M
model: opus
area: [fork]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [149]
created: 2026-10-27
---

One generic, rebase-friendly mechanism for D23 step 2: a new file in the VS Code tree that deregisters every view container whose id is listed in `product.json#vsslicer.removedViewContainers`, and holds our gear-menu entries (PLT-212). `IViewContainersRegistry.deregisterViewContainer` already exists (`vscode@07f806f:src/vs/workbench/common/views.ts:248-261`); it disposes the open command (`src/vs/workbench/services/views/browser/viewsService.ts:137,142`) and the activity-bar entry (`src/vs/workbench/browser/parts/paneCompositeBar.ts:243-249,366`). A new file can't conflict on a rebase; the only hunk in an upstream file is one import line. Research: `docs/research/vscodium-build.md` §4.

**Code:** `patches/vsslicer-contribution.patch` adding `src/vs/workbench/contrib/vsslicer/browser/vsslicer.contribution.ts` and one import in `src/vs/workbench/workbench.common.main.ts` (repo: `vsslicer/vsslicer-build`, layer: n/a (patch: a VS Code workbench contribution))

## Acceptance criteria

- [ ] A workbench contribution (phase `BlockStartup`) reads `product.vsslicer.removedViewContainers` and deregisters each listed container before the activity bar renders; an unknown id is logged, not thrown
- [ ] With the list empty the build behaves like VSCodium (no other change)
- [ ] With `workbench.view.debug` listed: no activity-bar entry, no View menu entry, `Ctrl/Cmd+Shift+D` does nothing, and the developer console shows no error from the container's views (if it does, the card falls back to guarding that one `registerViewContainer` call, and says so in the patch header)
- [ ] About 60 lines in all; patch header per PLT-149; `pnpm check-patches` passes
- [ ] The `product.json` key is added to the overlay schema (PLT-148)

## Tasks

- [ ] Write the contribution and the import
- [ ] Try it with Run and Debug listed, check the console
- [ ] Patch header and check
