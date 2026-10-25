---
id: 43
title: Create the `slicer-output` module
type: chore
priority: P1
effort: S
model: sonnet
area: [engine]
story: US10
milestone: "VSS:M3"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Engine-independent sliced-output writing: thumbnail encoders, thumbnail blocks in plain G-code, and `.gcode.3mf` assembly. A pure library tested in plain Node, used by `slicer-extension` now and by calibration, post-processing built-ins and the Prusa adapter later, so it is not buried in the extension.

**Code:** `vsslicer/modules/slicer-output/` (module: `slicer-output`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-output`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
