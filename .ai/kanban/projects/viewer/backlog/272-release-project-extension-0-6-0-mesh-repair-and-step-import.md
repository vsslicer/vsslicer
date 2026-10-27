---
id: 272
title: "Release `project-extension@0.6.0`: mesh repair and STEP import"
type: chore
priority: P1
effort: XS
model: sonnet
area: [step, repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP44"
depends_on: [247, 248, 249, 250, 266, 269, 270, 271, 227]
created: 2026-10-25
---

Releases `project-extension@0.6.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/apps/project/` (module: `project-extension`, layer: n/a (release))

## Acceptance criteria

- [ ] `project-extension@0.6.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] The VSIX builds with the WASM as a separate asset

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
