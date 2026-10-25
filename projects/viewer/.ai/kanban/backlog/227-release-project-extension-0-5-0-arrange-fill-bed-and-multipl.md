---
id: 227
title: "Release `project-extension@0.5.0`: arrange, fill bed and multiply"
type: chore
priority: P1
effort: XS
model: sonnet
area: [arrange]
story: US58
milestone: "VSS:M4"
depends_on: [223, 224, 225, 226, 201]
created: 2026-10-25
---

Releases `project-extension@0.5.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`.

**Code:** `vsslicer/modules/project-extension/` (module: `project-extension`, layer: n/a (release))

## Acceptance criteria

- [ ] `project-extension@0.5.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] The arrange command types install from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
