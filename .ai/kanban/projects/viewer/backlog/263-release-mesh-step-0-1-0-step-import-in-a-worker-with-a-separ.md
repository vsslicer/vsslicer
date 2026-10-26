---
id: 263
title: "Release `mesh-step@0.1.0`: STEP import in a worker with a separate WASM"
type: chore
priority: P1
effort: XS
model: sonnet
area: [step, mesh]
story: US70
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [259, 260, 261, 262, 252]
created: 2026-10-25
---

Releases `mesh-step@0.1.0` after the licence spike. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so the editor can depend on the range.

**Code:** `vsslicer/modules/mesh-step/` (module: `mesh-step`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh-step@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0`

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
