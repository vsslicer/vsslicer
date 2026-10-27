---
id: 170
title: "Release `3mf@0.5.0`: plate flags, settings and printer reference"
type: chore
priority: P1
effort: XS
model: sonnet
area: [3mf]
story: US52
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [168, 169, 98]
created: 2026-10-25
---

Releases `3mf@0.5.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/core/3mf/` (module: `3mf`, layer: n/a (release))

## Acceptance criteria

- [ ] `3mf@0.5.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.5.0`

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
