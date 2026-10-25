---
id: 74
title: "Release 3mf@0.2.0: readProject, dialect readers and the public API"
type: chore
priority: P0
effort: XS
model: sonnet
area: [3mf]
story: US26
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [33]
created: 2026-10-25
---

Releases `3mf@0.2.0`: readProject, all dialect readers and the public API. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so consumers can depend on the range.

**Code:** `vsslicer/modules/3mf/` (module: `3mf`, layer: n/a (release))

## Acceptance criteria

- [ ] `3mf@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.2.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
