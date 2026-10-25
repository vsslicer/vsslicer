---
id: 130
title: Create the `printer-folder` module
type: chore
priority: P0
effort: S
model: sonnet
area: [storage]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/printer-folder/` from the `tooling` module, so later cards add code in layers.

**Code:** `vsslicer/modules/printer-folder/` (module: `printer-folder`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `cd vsslicer/modules/printer-folder && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/printer-folder`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json, tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.
