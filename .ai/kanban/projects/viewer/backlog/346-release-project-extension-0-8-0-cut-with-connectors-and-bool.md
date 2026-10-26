---
id: 346
title: "Release `project-extension@0.8.0`: cut with connectors and boolean"
type: chore
priority: P2
effort: XS
model: sonnet
area: [editor, viewer]
story: US89
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [341, 343, 344, 338, 339, 340, 345]
created: 2026-10-25
---

Releases `project-extension@0.8.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/project-extension/` (module: `project-extension`, layer: n/a (release))

## Acceptance criteria

- [ ] `project-extension@0.8.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
