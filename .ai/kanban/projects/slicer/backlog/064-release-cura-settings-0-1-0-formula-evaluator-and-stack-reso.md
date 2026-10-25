---
id: 64
title: "Release `cura-settings@0.1.0`: formula evaluator and stack resolution"
type: chore
priority: P1
effort: XS
model: sonnet
area: [cura]
story: US13
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [63]
created: 2026-10-25
---

Releases `cura-settings@0.1.0` so other modules can depend on the range: formula evaluator and stack resolution. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/cura-settings/` (module: `cura-settings`, layer: n/a (release))

## Acceptance criteria

- [ ] `cura-settings@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
