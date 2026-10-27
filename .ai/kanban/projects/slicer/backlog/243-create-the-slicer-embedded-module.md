---
id: 243
title: Create the `slicer-embedded` module
type: chore
priority: P2
effort: S
model: sonnet
area: [embedded, engine]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

New engine adapter module for the zero-install engine. Its candidate is chosen by the spikes below; the implementation cards assume the expected winner (CuraEngine as WASM in a Node child process) and are revised if the decision says otherwise (E66).

**Code:** `vsslicer/modules/slicer/embedded/` (module: `slicer-embedded`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-embedded`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
