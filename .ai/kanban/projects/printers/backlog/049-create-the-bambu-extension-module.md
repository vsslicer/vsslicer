---
id: 49
title: Create the `bambu-extension` module
type: chore
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP10"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21, 29]
created: 2026-10-25
---

Scaffold `vsslicer/modules/bambu-extension/` from the `tooling` module as a VS Code extension module (`vsslicer.bambu, extensionKind ["ui"]`), so later cards add code in layers.

**Code:** `vsslicer/modules/bambu-extension/` (module: `bambu-extension`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `cd vsslicer/modules/bambu-extension && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/bambu-extension`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] `pnpm package` builds a VSIX for `vsslicer.bambu, extensionKind ["ui"]` that passes the VSIX content assertion

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json, tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.
