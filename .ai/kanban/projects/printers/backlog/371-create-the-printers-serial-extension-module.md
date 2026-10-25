---
id: 371
title: Create the `printers-serial-extension` module
type: chore
priority: P2
effort: S
model: sonnet
area: [serial]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21, 369, 339]
created: 2026-10-25
---

Scaffold `vsslicer/modules/printers-serial-extension/` from the `tooling` module as a VS Code extension module (`vsslicer.printers-serial`, `extensionKind ["ui"]`), so later cards add code in layers.

**Code:** `vsslicer/modules/printers-serial-extension/` (module: `printers-serial-extension`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `cd vsslicer/modules/printers-serial-extension && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/printers-serial-extension`, own lockfile, changelog, version 0.0.1)
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] `pnpm package` builds a VSIX that passes the VSIX content assertion

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json, tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.
