---
id: 317
title: Create the `mesh-boolean` module
type: chore
priority: P2
effort: XS
model: sonnet
area: [mesh]
story: US90
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Creates `vsslicer/modules/mesh-boolean/` from the `tooling` module. Cut and boolean on manifold-3d (Apache-2.0, WASM). It is its own module because it brings a third-party WASM with its own size and release risk, it is loaded only when the tools are used, and only the editor consumes it (the same reasoning as `mesh-step`). It depends on `mesh` for the mesh types, statistics, repair check and `PaintLayer`.

**Code:** `vsslicer/modules/mesh-boolean/` (module: `mesh-boolean`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/` folders exist and the layer lint passes
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] Package name `@vsslicer/mesh-boolean`; the licence field and the third-party notice for the WASM are set

## Tasks

- [ ] Scaffold from tooling
- [ ] Lint and CI job
- [ ] README

## Progress

Not started.
