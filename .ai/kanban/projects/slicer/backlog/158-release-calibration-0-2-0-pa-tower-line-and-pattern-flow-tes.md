---
id: 158
title: "Release `calibration@0.2.0`: PA tower, line and pattern, flow tests, input shaping, cornering and static models"
type: chore
priority: P2
effort: XS
model: sonnet
area: [calibration]
story: US42
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [148, 149, 150, 151, 152, 155, 157]
created: 2026-10-25
---

Releases `calibration@0.2.0` so other modules can depend on the range: PA tower, line and pattern, flow tests, input shaping, cornering and static models. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/calibration/` (module: `calibration`, layer: n/a (release))

## Acceptance criteria

- [ ] `calibration@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.2.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `node scripts/run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
