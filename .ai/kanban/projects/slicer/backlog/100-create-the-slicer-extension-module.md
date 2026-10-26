---
id: 100
title: Create the `slicer-extension` module
type: chore
priority: P0
effort: S
model: sonnet
area: [tasks]
story: US18
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21]
created: 2026-10-25
---

The `vsslicer.slicer` extension: engine registry and settings, `Slicer.slice` export, the slice pipeline, post-processing, tasks, problem matchers and commands. Presentation only touches the VS Code API; the pipeline and post-processing run in plain Node.

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [ ] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-extension`, version `0.0.0` and `AGPL-3.0-or-later`
- [ ] The extension activates in `@vscode/test-electron` and a VSIX packs (PLT-21) with id `vsslicer.slicer`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.
