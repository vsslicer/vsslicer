---
id: 214
title: "Release `arrange@0.1.0`: single-plate arrange in a worker"
type: chore
priority: P1
effort: XS
model: sonnet
area: [arrange]
story: US61
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [213]
created: 2026-10-25
---

Releases `arrange@0.1.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/arrange/` (module: `arrange`, layer: n/a (release))

## Acceptance criteria

- [ ] `arrange@0.1.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.1.0`

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
