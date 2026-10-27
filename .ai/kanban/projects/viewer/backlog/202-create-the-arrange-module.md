---
id: 202
title: Create the `arrange` module
type: chore
priority: P1
effort: XS
model: sonnet
area: [arrange]
story: US61
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Creates `vsslicer/modules/core/arrange/` from the `tooling` module: a pure geometry library for arranging objects, consumed by the editor, the slicer extension and the fleet queue. It has no VS Code and no `mesh` dependency.

**Code:** `vsslicer/modules/core/arrange/` (module: `arrange`, layer: n/a (module scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/` folders exist and the layer lint passes
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] Package name `@vsslicer/arrange`, SPDX headers and the licence field are set

## Tasks

- [ ] Scaffold from tooling
- [ ] Lint and CI job
- [ ] README with the consumer list

## Progress

Not started.
