---
id: 51
title: Create the `project-extension` module
type: chore
priority: P0
effort: S
model: sonnet
area: [viewer]
story: US16
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21]
created: 2026-10-25
---

Creates the `project-extension` module from the `tooling` module. It is the VS Code extension `vsslicer.project`.

**Code:** `vsslicer/modules/project-extension/` (module: `project-extension`, layer: n/a (scaffold))

## Acceptance criteria

- [ ] `cd vsslicer/modules/project-extension && pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] Folders `domain/`, `application/`, `adapters/`, `presentation/` exist as needed and the layer-boundary lint rule runs
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] Package name `@vsslicer/project-extension`, version 0.0.0, changelog and SPDX headers present
- [ ] VSIX packages within the size budget

## Tasks

- [ ] Create from the tooling module
- [ ] Add the layer folders and a smoke test
- [ ] Check `run.mjs ci`

## Progress

Not started.
