---
id: 57
title: Create the `profiles-extension` module (vsslicer.profiles)
type: chore
priority: P0
effort: S
model: sonnet
area: [store]
story: US25
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21, PLT-15]
created: 2026-10-25
---

Creates the independent `profiles-extension` module, the VS Code extension `vsslicer.profiles` and composition root that wires the `profiles` core to the ecosystem adapters.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/` and `vsslicer/modules/profiles-extension/package.json` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/profiles-extension` with nothing else built; `node scripts/run.mjs ci` picks it up
- [ ] The extension activates on a workspace containing `.vsslicer/profiles/` or when its view is opened, in an `@vscode/test-electron` run on the minimum `engines.vscode`
- [ ] The VSIX packages and passes the PLT-21 content assertion; the PLT-4 layer-boundary lint passes (VS Code API only under `presentation`)
- [ ] `package.json` declares semver ranges on `@vsslicer/profiles` and the three adapter modules; it is the only module that does

## Tasks

- [ ] Generate the module from the tooling template
- [ ] Create the manifest and entry point
- [ ] Add the activation test

## Progress

Not started.
