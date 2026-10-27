---
id: 252
title: "Release `slicer-cura@0.4.0`: uses the shared settings writer from `cura-settings`"
type: chore
priority: P2
effort: XS
model: sonnet
area: [embedded]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP51"
depends_on: [251, 183]
created: 2026-10-25
---

Releases `slicer-cura@0.4.0` so other modules can depend on the range: uses the shared settings writer from `cura-settings`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer/cura/` (module: `slicer-cura`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-cura@0.4.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.4.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `node scripts/run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
