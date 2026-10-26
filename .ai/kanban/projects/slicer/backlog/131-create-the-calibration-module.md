---
id: 131
title: Create the `calibration` module
type: chore
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

New library module for calibration tests: sweep definitions, test model generators, firmware command table, block-to-value mapping and the write-back plan. It has no VS Code dependency, so the printer agent can reuse `Calibration.run` later (E62).

**Code:** `vsslicer/modules/calibration/` (module: `calibration`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/calibration`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
