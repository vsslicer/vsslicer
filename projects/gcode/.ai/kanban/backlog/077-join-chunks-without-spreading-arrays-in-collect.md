---
id: 77
title: Join chunks without spreading arrays in collect
type: bug
priority: P0
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Module `gcode-parser`, application layer. A 4 MB file of 840,000 `M400` lines makes `collect` throw "Maximum call stack size exceeded" (finding 2). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [ ] `collect` handles a chunk with 1,000,000 markers
- [ ] A regression test with 300,000 marker lines passes

## Tasks

- [ ] Replace the four `push(...x)` calls with loops
- [ ] Regression test
- [ ] Release a patch version

## Progress

Not started.
