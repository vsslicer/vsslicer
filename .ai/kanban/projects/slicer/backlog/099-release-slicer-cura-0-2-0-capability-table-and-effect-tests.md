---
id: 99
title: "Release `slicer-cura@0.2.0`: capability table and effect tests"
type: chore
priority: P1
effort: XS
model: sonnet
area: [cura]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [98]
created: 2026-10-25
---

Releases `slicer-cura@0.2.0` so other modules can depend on the range: capability table and effect tests. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-cura@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.2.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
