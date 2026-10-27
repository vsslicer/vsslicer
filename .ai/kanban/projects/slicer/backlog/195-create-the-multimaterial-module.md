---
id: 195
title: Create the `multimaterial` module
type: chore
priority: P2
effort: S
model: sonnet
area: [multimaterial]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

New library module for multi-material logic with no VS Code dependency: the flush volume calculator, the models of tower, purge, feature-assignment and nozzle-map settings. PRN's send-time remapping can reuse the calculator (E63).

**Code:** `vsslicer/modules/core/multimaterial/` (module: `multimaterial`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/multimaterial`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
