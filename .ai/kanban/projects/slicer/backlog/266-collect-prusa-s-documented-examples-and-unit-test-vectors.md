---
id: 266
title: "Collect Prusa's documented examples and unit-test vectors"
type: chore
priority: P2
effort: S
model: sonnet
area: [postprocess]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [265]
created: 2026-10-25
---

Collects test vectors (rule list, input G-code, expected output) from Prusa's documentation and unit tests where they exist (AGPL-3.0, D2).

**Code:** `vsslicer/modules/slicer-extension/test/fixtures/substitutions/` (module: `slicer-extension`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Each vector file names its source (`repo@tag:path` or the documentation URL)
- [ ] At least one vector per flag and one for a replacement with captured groups
- [ ] Vectors that need unsupported constructs are marked so tests expect the failure

## Tasks

- [ ] Collect
- [ ] Normalise to one format
- [ ] Provenance

## Progress

Not started.
