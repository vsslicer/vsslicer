---
id: 165
title: "Release `project-extension@0.3.0`: object, volume and override commands"
type: chore
priority: P1
effort: XS
model: sonnet
area: [editor]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [160, 161, 164, 157, 156, 159, 129]
created: 2026-10-25
---

Releases `project-extension@0.3.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/project-extension/` (module: `project-extension`, layer: n/a (release))

## Acceptance criteria

- [ ] `project-extension@0.3.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] Exported command types install from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
