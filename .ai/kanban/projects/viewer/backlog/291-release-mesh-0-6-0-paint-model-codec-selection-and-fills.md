---
id: 291
title: "Release `mesh@0.6.0`: paint model, codec, selection and fills"
type: chore
priority: P2
effort: XS
model: sonnet
area: [mesh, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [277, 281, 283, 284, 285, 286, 287, 288, 289, 290]
created: 2026-10-25
---

Releases `mesh@0.6.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/mesh/` (module: `mesh`, layer: n/a (release))

## Acceptance criteria

- [ ] `mesh@0.6.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
