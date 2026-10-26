---
id: 250
title: "Release `cura-settings@0.2.0`: CuraEngine settings-file writer"
type: chore
priority: P2
effort: XS
model: sonnet
area: [embedded]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [249]
created: 2026-10-25
---

Releases `cura-settings@0.2.0` so other modules can depend on the range: CuraEngine settings-file writer. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/cura-settings/` (module: `cura-settings`, layer: n/a (release))

## Acceptance criteria

- [ ] `cura-settings@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.2.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `node scripts/run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
