---
id: 291
title: Create the `camera-extension` module
type: chore
priority: P1
effort: S
model: sonnet
area: [camera]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21]
created: 2026-10-25
---

Scaffold `vsslicer/modules/apps/camera/` from the `tooling` module as a VS Code extension module (`vsslicer.camera`, `extensionKind ["ui"]`).

**Code:** `vsslicer/modules/apps/camera/` (module: `camera-extension`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/camera-extension`, own lockfile, changelog, version 0.0.1)
- [ ] `pnpm package` builds a VSIX for `vsslicer.camera` that passes the VSIX content assertion; `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json, lint and vitest config
- [ ] Add a smoke test and CI entry

## Progress

Not started.
