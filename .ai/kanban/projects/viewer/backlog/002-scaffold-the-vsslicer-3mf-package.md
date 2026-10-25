---
id: 2
title: Create the `3mf` module
type: chore
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, 1]
created: 2026-10-25
---

Creates the `3mf` module from the `tooling` module.

**Code:** `vsslicer/modules/3mf/` (module: `3mf`, layer: n/a (scaffold))

## Acceptance criteria

- [ ] `cd vsslicer/modules/3mf && pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] Folders `domain/`, `application/`, `adapters/` exist as needed and the layer-boundary lint rule runs
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] Package name `@vsslicer/3mf`, version 0.0.0, changelog and SPDX headers present

## Tasks

- [ ] Create from the tooling module
- [ ] Add the layer folders and a smoke test
- [ ] Check `run.mjs ci`

## Progress

Not started.
