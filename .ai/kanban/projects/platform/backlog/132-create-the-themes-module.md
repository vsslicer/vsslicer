---
id: 132
title: Create the `themes` module
type: chore
priority: P3
effort: S
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [2, 3, 4, 8, 14, 21]
created: 2026-10-25
---

Creates the extension module `vsslicer.themes` from the tooling module and the sample extension; no code runs at activation (themes are declarative).

**Code:** `vsslicer/modules/themes/` (module: `themes`, layer: n/a (extension))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/themes`; `node scripts/run.mjs ci` picks it up
- [ ] The VSIX packaging task builds a VSIX with the content assertion
- [ ] Extension id `vsslicer.themes`, no activation events

## Tasks

- [ ] Create from `tooling` and the sample extension
- [ ] Add the CI job

## Progress

Not started.
