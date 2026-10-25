---
id: 180
title: Create the `job-history` module
type: chore
priority: P1
effort: S
model: sonnet
area: [history]
story: US50
milestone: "VSS:M4"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

New library module `@vsslicer/job-history`: the job record, its JSONL store, queries, back-fill merge and job id embedding, with no VS Code API.

**Code:** `vsslicer/modules/job-history/` (module: `job-history`, layer: `n/a (scaffold)`)

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [ ] `domain/ application/ adapters/` folders as needed, with the layer-boundary lint rule on
- [ ] `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the `tooling` layout
- [ ] Add a smoke test
- [ ] Check `run.mjs ci`

## Progress

Not started.
