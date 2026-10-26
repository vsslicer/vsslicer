---
id: 82
title: "Release `slicer-cura@0.1.0`: CuraEngine detection, install and the CLI adapter"
type: chore
priority: P1
effort: XS
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [71, 70, 76, 78, 79, 80, 81]
created: 2026-10-25
---

Releases `slicer-cura@0.1.0` so other modules can depend on the range: CuraEngine detection, install and the CLI adapter. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-cura@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
