---
id: 147
title: "Release `calibration@0.1.0`: sweep engine, firmware table, towers (temperature, retraction, max volumetric speed, VFA), pick mapping, write-back plan and `Calibration.run`"
type: chore
priority: P2
effort: XS
model: sonnet
area: [calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [144, 146]
created: 2026-10-25
---

Releases `calibration@0.1.0` so other modules can depend on the range: sweep engine, firmware table, towers (temperature, retraction, max volumetric speed, VFA), pick mapping, write-back plan and `Calibration.run`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/calibration/` (module: `calibration`, layer: n/a (release))

## Acceptance criteria

- [ ] `calibration@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `node scripts/run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
