---
id: 120
title: Create the `printer-discovery` module
type: chore
priority: P1
effort: S
model: sonnet
area: [discovery]
story: US23
milestone: "VSS:M3"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/printer-discovery/` from the `tooling` module, so later cards add code in layers.

**Code:** `vsslicer/modules/printer-discovery/` (module: `printer-discovery`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `cd vsslicer/modules/printer-discovery && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/printer-discovery`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json, tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.
