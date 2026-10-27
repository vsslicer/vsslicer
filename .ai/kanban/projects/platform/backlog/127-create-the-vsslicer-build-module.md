---
id: 127
title: Create the `vsslicer-build` module
type: chore
priority: P2
effort: S
model: sonnet
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [2, 3, 4, 8]
created: 2026-10-25
---

Creates the module that holds our patches, `product.json` overlay and build scripts on top of a pinned VSCodium tag, from the tooling module.

**Code:** `vsslicer/modules/tooling/vsslicer-build/` (module: `vsslicer-build`, layer: n/a (build scripts))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/tooling/vsslicer-build`
- [ ] `node scripts/run.mjs ci` picks the module up
- [ ] `domain/ application/ adapters/` folders exist where code lands; `build/` holds the scripts and patches

## Tasks

- [ ] Create the module from `tooling`
- [ ] Add the CI job

## Progress

Not started.
