---
id: 200
title: Create the `fleet-queue` module
type: chore
priority: P2
effort: S
model: sonnet
area: [fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

New library module `@vsslicer/fleet-queue`: the queue item, its state machine, the compatibility check and the store, with no VS Code API.

**Code:** `vsslicer/modules/printer/fleet-queue/` (module: `fleet-queue`, layer: `n/a (scaffold)`)

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/` folders as needed, with the layer-boundary lint rule on
- [ ] `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the `tooling` layout
- [ ] Add a smoke test
- [ ] Check `run.mjs ci`

## Progress

Not started.
