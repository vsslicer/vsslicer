---
id: 1
title: Create the `filament` module
type: chore
priority: P1
effort: S
model: sonnet
area: [model]
story: US1
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/filament/` from the `tooling` module as a library module, so later cards add code in layers.

**Code:** `vsslicer/modules/filament/` (module: `filament`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `cd vsslicer/modules/filament && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/filament`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json (licence `AGPL-3.0-or-later`), tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.
