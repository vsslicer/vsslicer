---
id: 92
title: "Release `slicer-api@0.2.0`: capability tables, coverage check, report, warning function and the effect-test kit"
type: chore
priority: P0
effort: XS
model: sonnet
area: [engine]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [84, 85, 86, 88, 89, 90, 91]
created: 2026-10-25
---

Releases `slicer-api@0.2.0` so other modules can depend on the range: capability tables, coverage check, report, warning function and the effect-test kit. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (release))

## Acceptance criteria

- [ ] `slicer-api@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.2.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
