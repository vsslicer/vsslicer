---
id: 127
title: Create the `vsslicer-build` repository
type: chore
priority: P0
effort: S
model: sonnet
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP15"
created: 2026-10-25
---

Sets up the public repo `vsslicer/vsslicer-build` (owner-created, empty) that holds our `product.json` overlay, removal list, patches and build scripts on top of a pinned VSCodium release tag. It's its own repository, not a module under `vsslicer/` (owner, 2026-10-27); it follows the module rules anyway: own `package.json`, lockfile, tests, changelog, CI, and the clean-architecture layers. Research: `docs/research/vscodium-build.md`.

**Code:** repo root: `package.json`, `src/{domain,application,adapters}/`, `patches/`, `test/`, `.github/workflows/ci.yml` (repo: `vsslicer/vsslicer-build`, layer: n/a (scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works in a fresh clone with nothing else built; the TypeScript, ESLint (layer-boundary rule) and vitest config match `tooling`'s, copied with a note of the `tooling` version, because a public repo's CI can't reach the local registry (D12)
- [ ] `LICENSE` is AGPL-3.0-or-later; `NOTICE` says the build scripts follow VSCodium (MIT) and Code-OSS (MIT)
- [ ] `README.md` says what the repo builds and links D23, D24 and the research report
- [ ] A CI workflow runs lint and unit tests on push and pull request

## Tasks

- [ ] Clone the empty repo next to this one (`~/Workspace/vsslicer-build`) and scaffold it
- [ ] Copy the tooling config and record its version
- [ ] Add the CI workflow

## Progress

Not started.
