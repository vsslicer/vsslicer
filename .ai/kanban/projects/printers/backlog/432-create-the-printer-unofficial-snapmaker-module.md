---
id: 432
title: Create the `printer-unofficial-snapmaker` module
type: chore
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, 320]
created: 2026-10-25
---

Scaffold `vsslicer/modules/printer-unofficial-snapmaker/` from the `tooling` module so later cards add code in layers.

**Code:** `vsslicer/modules/printer-unofficial-snapmaker/` (module: `printer-unofficial-snapmaker`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `cd vsslicer/modules/printer-unofficial-snapmaker && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/printer-unofficial-snapmaker`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json, tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.
