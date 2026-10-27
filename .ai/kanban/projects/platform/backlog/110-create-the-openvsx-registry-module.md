---
id: 110
title: Create the `vsslicer-marketplace` repository
type: chore
priority: P0
effort: S
model: sonnet
area: [registry]
story: US72
milestone: "VSS:M6"
sprint: "VSS:SP15"
created: 2026-10-25
---

Sets up the public repo `vsslicer/vsslicer-marketplace` (owner-created, empty) for the static marketplace (D24): the `index.json` schema, the generator and the Pages site. Its own repository, following the module rules (own `package.json`, lockfile, tests, CI, layers).

**Code:** repo root: `package.json`, `src/{domain,application,adapters}/`, `site/`, `.github/workflows/ci.yml` (repo: `vsslicer/vsslicer-marketplace`, layer: n/a (scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works in a fresh clone; TypeScript, ESLint (layer-boundary rule) and vitest config copied from `tooling` with its version noted (the local registry isn't reachable from a public repo's CI, D12)
- [ ] `LICENSE` AGPL-3.0-or-later; `README.md` links D24
- [ ] CI runs lint and tests on push and pull request

## Tasks

- [ ] Clone the empty repo next to this one (`~/Workspace/vsslicer-marketplace`) and scaffold it
- [ ] CI workflow

## Progress

Not started.
