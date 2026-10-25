---
id: 251
title: Create the `mesh-step` module
type: chore
priority: P1
effort: XS
model: sonnet
area: [step, mesh]
story: US70
milestone: "VSS:M4"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Creates `vsslicer/modules/mesh-step/` from the `tooling` module: STEP to indexed meshes through `occt-import-js`, loaded as a separate WASM file. It is its own module because it brings a third-party WASM with its own licence and release risk, and only the editor consumes it.

**Code:** `vsslicer/modules/mesh-step/` (module: `mesh-step`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/` folders exist and the layer lint passes
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] Package name `@vsslicer/mesh-step`; the licence field and the third-party notice for the WASM are set

## Tasks

- [ ] Scaffold from tooling
- [ ] Lint and CI job
- [ ] README

## Progress

Not started.
