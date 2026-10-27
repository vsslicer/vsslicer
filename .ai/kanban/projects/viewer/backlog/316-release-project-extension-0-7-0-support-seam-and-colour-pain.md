---
id: 316
title: "Release `project-extension@0.7.0`: support, seam and colour painting"
type: chore
priority: P2
effort: XS
model: sonnet
area: [viewer, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [307, 308, 309, 310, 302, 304, 312, 313, 315]
created: 2026-10-25
---

Releases `project-extension@0.7.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/apps/project/` (module: `project-extension`, layer: n/a (release))

## Acceptance criteria

- [ ] `project-extension@0.7.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
