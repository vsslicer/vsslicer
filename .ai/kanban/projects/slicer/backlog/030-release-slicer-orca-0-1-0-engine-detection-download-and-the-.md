---
id: 30
title: "Release `slicer-orca@0.1.0`: engine detection, download and the CLI adapter"
type: chore
priority: P0
effort: XS
model: sonnet
area: [orca]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [21, 22, 25, 27]
created: 2026-10-25
---

Releases `slicer-orca@0.1.0` so other modules can depend on the range: engine detection, download and the CLI adapter. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer/orca/` (module: `slicer-orca`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-orca@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
