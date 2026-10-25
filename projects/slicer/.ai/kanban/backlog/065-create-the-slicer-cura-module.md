---
id: 65
title: Create the `slicer-cura` module
type: chore
priority: P1
effort: S
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Adapter module for CuraEngine: engine acquisition from the pinned Cura release, the headless CLI driver, STL export of plates and the Cura capability table. Depends on `slicer-api`, `slicer-runtime`, `cura-settings`, `mesh` and `profile-api`.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-cura`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
