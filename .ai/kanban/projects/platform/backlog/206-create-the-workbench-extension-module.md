---
id: 206
title: Create the `workbench-extension` module
type: chore
priority: P1
effort: S
model: sonnet
area: [fork]
story: US71
milestone: "VSS:M6"
created: 2026-10-27
---

Scaffold `vsslicer/modules/apps/workbench/` (`vsslicer.workbench`) from the `tooling` module as a VS Code extension module. It hosts what replaces stock chrome in the VSSlicer build (D23 step 2): the VSSlicer settings page and the VSSlicer extensions view. It also installs in stock VS Code, where both are extra views.

**Code:** `vsslicer/modules/apps/workbench/` (module: `workbench-extension`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `cd vsslicer/modules/apps/workbench && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/workbench-extension`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up; `pnpm package` builds a VSIX that passes the content assertion

## Tasks

- [ ] Scaffold from `tooling`
- [ ] Lint check and VSIX

## Progress

Not started.
