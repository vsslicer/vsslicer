---
id: 98
title: "Release `3mf@0.4.0`: dialect conversion and generic export"
type: chore
priority: P1
effort: XS
model: sonnet
area: [3mf]
story: US34
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [93, 94, 96, 97, 91]
created: 2026-10-25
---

Releases `3mf@0.4.0`: Prusa and Cura conversion, `exportGeneric` and their validation. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/3mf/` (module: `3mf`, layer: n/a (release))

## Acceptance criteria

- [ ] `3mf@0.4.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.4.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
