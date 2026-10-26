---
id: 8
title: Create the `slicer-runtime` module
type: chore
priority: P0
effort: S
model: sonnet
area: [engine]
story: US5
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Shared engine plumbing used by both adapters: a process runner with tree-kill, staged output, a verified downloader and archive extraction. Needs no engine knowledge, so it is a module of its own instead of being copied into `slicer-orca` and `slicer-cura`.

**Code:** `vsslicer/modules/slicer-runtime/` (module: `slicer-runtime`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-runtime`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
