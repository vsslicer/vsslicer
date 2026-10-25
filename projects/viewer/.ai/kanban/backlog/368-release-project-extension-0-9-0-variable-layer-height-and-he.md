---
id: 368
title: "Release `project-extension@0.9.0`: variable layer height and height-range tool"
type: chore
priority: P2
effort: XS
model: sonnet
area: [viewer, editor]
story: US94
milestone: "VSS:M5"
sprint: "VSS:SP33"
depends_on: [361, 363, 365, 366, 367]
created: 2026-10-25
---

Releases `project-extension@0.9.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/project-extension/` (module: `project-extension`, layer: n/a (release))

## Acceptance criteria

- [ ] `project-extension@0.9.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
