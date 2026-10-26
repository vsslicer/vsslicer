---
id: 244
title: "Release `mesh@0.5.0`: repair on request"
type: chore
priority: P1
effort: XS
model: sonnet
area: [mesh]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [242, 243, 237]
created: 2026-10-25
---

Releases `mesh@0.5.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so the editor and the cut tool can use `repair`.

**Code:** `vsslicer/modules/mesh/` (module: `mesh`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh@0.5.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.5.0`

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
