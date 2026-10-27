---
id: 448
title: Create the `printer-mock` module
type: chore
priority: P0
effort: S
model: sonnet
area: [api]
story: US75
milestone: "VSS:M3"
sprint: "VSS:SP14"
created: 2026-10-27
---

Scaffold `vsslicer/modules/printer/mock/` from the `tooling` module as a library module, like the other `printer/*` modules, so PRN mock adapter work has a home (D23).

**Code:** `vsslicer/modules/printer/mock/` (module: `printer-mock`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `cd vsslicer/modules/printer/mock && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/printer-mock`, own lockfile, changelog, version 0.0.1, AGPL-3.0-or-later)
- [ ] `domain/ application/ adapters/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up in dependency order after `printer-api`

## Tasks

- [ ] Scaffold from `tooling`
- [ ] Lint check with a deliberate violation

## Progress

Not started.
