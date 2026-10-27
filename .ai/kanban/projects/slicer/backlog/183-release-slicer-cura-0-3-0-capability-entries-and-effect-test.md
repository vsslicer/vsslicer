---
id: 183
title: "Release `slicer-cura@0.3.0`: capability entries and effect tests for the P2 rows, one-at-a-time messages"
type: chore
priority: P2
effort: XS
model: sonnet
area: [cura]
story: US59
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [182]
created: 2026-10-25
---

Releases `slicer-cura@0.3.0` so other modules can depend on the range: capability entries and effect tests for the P2 rows, one-at-a-time messages. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer/cura/` (module: `slicer-cura`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-cura@0.3.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.3.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `node scripts/run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
