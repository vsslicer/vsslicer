---
id: 15
title: Create the `filament-extension` module
type: chore
priority: P0
effort: S
model: sonnet
area: [ui]
story: US5
milestone: "VSS:M4"
sprint: "VSS:SP14"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21, 98]
created: 2026-10-25
---

Scaffold `vsslicer/modules/apps/filament/` from the `tooling` module as a VS Code extension module (`vsslicer.filament`, `extensionKind ["ui", "workspace"]`), so later cards add code in layers.

**Code:** `vsslicer/modules/apps/filament/` (module: `filament-extension`, layer: `n/a (module scaffold)`)

**E70 (2026-10-27):** depends on the in-memory release `filament@0.0.2` (FIL-98) instead of `filament@0.1.0` (FIL-14), so the extension starts before the event log and lock files land; it takes `@vsslicer/filament` at `^0.0.2` and moves to `^0.1.0` with FIL-16.

## Acceptance criteria

- [ ] `cd vsslicer/modules/apps/filament && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/filament-extension`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] `pnpm package` builds a VSIX for `vsslicer.filament` that passes the VSIX content assertion

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json (licence `AGPL-3.0-or-later`), tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.
