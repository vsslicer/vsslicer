---
id: 205
title: "Release `multimaterial@0.1.0`: flush matrix calculator, tower, purge, feature assignment and nozzle map models"
type: chore
priority: P2
effort: XS
model: sonnet
area: [multimaterial]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [198, 199, 200, 201, 202, 203, 204]
created: 2026-10-25
---

Releases `multimaterial@0.1.0` so other modules can depend on the range: flush matrix calculator, tower, purge, feature assignment and nozzle map models. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/multimaterial/` (module: `multimaterial`, layer: n/a (release))

## Acceptance criteria

- [ ] `multimaterial@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0` from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `node scripts/run.mjs publish`
- [ ] Install check from a scratch consumer

## Progress

Not started.
