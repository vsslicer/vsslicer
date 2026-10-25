---
id: 216
title: Create the `slicer-prusa` module
type: chore
priority: P2
effort: S
model: sonnet
area: [prusa, engine]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

New engine adapter module for the PrusaSlicer CLI (2.9.x first, 3.0 behind a setting). It depends on `slicer-api` and never on `slicer-orca` or `slicer-cura` (E65).

**Code:** `vsslicer/modules/slicer-prusa/` (module: `slicer-prusa`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-prusa`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
