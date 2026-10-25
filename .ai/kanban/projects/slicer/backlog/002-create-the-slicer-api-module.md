---
id: 2
title: Create the `slicer-api` module
type: chore
priority: P0
effort: S
model: sonnet
area: [engine]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Shared boundary module for the slicer: the `SlicerEngine` port, job and event types, typed errors, engine discovery contract, capability tables and the effect-test kit. Adapters (`slicer-orca`, `slicer-cura`) depend on it, never on each other.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-api`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
