---
id: 388
title: "Release `project-extension@0.10.0`: measure, scale to length and auto-orient"
type: chore
priority: P2
effort: XS
model: sonnet
area: [viewer, editor]
story: US98
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [384, 387, 386]
created: 2026-10-25
---

Releases `project-extension@0.10.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/project-extension/` (module: `project-extension`, layer: n/a (release))

## Acceptance criteria

- [ ] `project-extension@0.10.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
