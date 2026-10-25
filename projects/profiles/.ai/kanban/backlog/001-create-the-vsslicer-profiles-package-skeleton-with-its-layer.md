---
id: 1
title: Create the `profile-api` module
type: chore
priority: P0
effort: S
model: sonnet
area: [schema]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-13]
created: 2026-10-25
---

Creates the independent `profile-api` module (entities, schema, catalogue, pure condition and merge code, ports) from the `tooling` module; adapters and the core depend on it, it depends on nothing.

**Code:** `vsslicer/modules/profile-api/` (module: `profile-api`, layer: n/a (scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/profile-api` with nothing else built
- [ ] `domain/ application/` folders exist; a deliberately broken import from `domain` to `application` fails the PLT-4 layer-boundary lint
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] `package.json` has name `@vsslicer/profile-api`, version `0.0.0`, licence AGPL-3.0-or-later and no dependency on another VSSlicer module
- [ ] A `test/fixtures/` folder with a `PROVENANCE.md` template accepted by the PLT fixtures check exists

## Tasks

- [ ] Generate the module from the tooling template
- [ ] Add the layer folders and placeholder tests
- [ ] Add the boundary-violation fixture test

## Progress

Not started.
