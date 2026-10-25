---
id: 177
title: Remove the stray package.json and .vscodeignore at the repository root
type: bug
priority: P1
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Untracked leftovers of `example-extension` 0.5.0 at the root break "all code lives in `vsslicer/`" (finding 5). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [ ] Neither file exists at the root
- [ ] No script or doc refers to them

## Tasks

- [ ] Delete both files
- [ ] Check nothing at the root writes them again

## Progress

Not started.
