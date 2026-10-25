---
id: 237
title: "Release `mesh@0.4.0`: lossless repair on load"
type: chore
priority: P1
effort: XS
model: sonnet
area: [mesh]
story: US63
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [235, 236, 134]
created: 2026-10-25
---

Releases `mesh@0.4.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so the editor and STEP import can use `repairOnLoad`.

**Code:** `vsslicer/modules/mesh/` (module: `mesh`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh@0.4.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.4.0`

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
