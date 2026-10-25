---
id: 261
title: "Release `slicer-embedded@0.1.0`: zero-install engine adapter with capability table"
type: chore
priority: P2
effort: XS
model: sonnet
area: [embedded]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP29"
depends_on: [258, 259, 260, 255]
created: 2026-10-25
---

Releases `slicer-embedded@0.1.0` so other modules can depend on the range: zero-install engine adapter with capability table. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer-embedded/` (module: `slicer-embedded`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-embedded@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `node scripts/run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
