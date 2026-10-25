---
id: 15
title: Create the `slicer-orca` module
type: chore
priority: P0
effort: S
model: sonnet
area: [orca]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Adapter module for OrcaSlicer: detection, download, the CLI driver, preset emission from resolved profiles and the Orca capability table. Depends on `slicer-api`, `slicer-runtime` and `profile-api`.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-orca`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
