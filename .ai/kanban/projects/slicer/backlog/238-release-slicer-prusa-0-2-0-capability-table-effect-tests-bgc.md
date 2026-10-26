---
id: 238
title: "Release `slicer-prusa@0.2.0`: capability table, effect tests, `.bgcode` comparison and the 3.0 option"
type: chore
priority: P2
effort: XS
model: sonnet
area: [prusa]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [231, 233, 234, 235, 237]
created: 2026-10-25
---

Releases `slicer-prusa@0.2.0` so other modules can depend on the range: capability table, effect tests, `.bgcode` comparison and the 3.0 option. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer-prusa/` (module: `slicer-prusa`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-prusa@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.2.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `node scripts/run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
