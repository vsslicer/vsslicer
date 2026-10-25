---
id: 118
title: Create the `profiles` module
type: chore
priority: P0
effort: S
model: sonnet
area: [store]
story: US20
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Creates the independent `profiles` module from the `tooling` module. It depends on `profile-api` only through a semver range; the ecosystem adapters are wired in by `profiles-extension`, never imported here.

**Code:** `vsslicer/modules/profiles/` (module: `profiles`, layer: n/a (scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/profiles` with nothing else built
- [ ] `domain/ application/ adapters/ presentation/` folders exist as needed; a deliberately broken import across layers fails the PLT-4 layer-boundary lint
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] `package.json` has name `@vsslicer/profiles`, version `0.0.0`, licence AGPL-3.0-or-later and semver ranges only on published modules it needs

## Tasks

- [ ] Generate the module from the tooling template
- [ ] Add one placeholder test per layer folder
- [ ] Run `run.mjs ci`

## Progress

Not started.
