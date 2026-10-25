---
id: 55
title: Create the `cura-settings` module
type: chore
priority: P1
effort: S
model: sonnet
area: [cura]
story: US13
milestone: "VSS:M3"
sprint: "VSS:SP12"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Cura settings resolution: the formula evaluator for the Python-expression subset in Cura's definitions and the container stack resolver. Own module because the CuraEngine adapter and PRF's settings form both consume it and PRF must not build a second evaluator.

**Code:** `vsslicer/modules/cura-settings/` (module: `cura-settings`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/cura-settings`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
