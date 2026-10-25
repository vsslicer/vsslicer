---
id: 110
title: Create the `openvsx-registry` module
type: chore
priority: P2
effort: S
model: sonnet
area: [registry]
story: US60
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [2, 3, 4, 8]
created: 2026-10-25
---

Creates the deployment module for the self-hosted Open VSX registry from the tooling module (no server code is written: configuration, scripts and tests only).

**Code:** `vsslicer/modules/openvsx-registry/` (module: `openvsx-registry`, layer: n/a (deployment))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/openvsx-registry`
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] A `compose/`, `scripts/` and `test/` layout exists; a smoke test asserts the layout and the pinned Open VSX server image tag in one config file

## Tasks

- [ ] Create the module from `tooling`
- [ ] Pin the Open VSX server and web UI versions in one config file
- [ ] Add the CI job

## Progress

Not started.
