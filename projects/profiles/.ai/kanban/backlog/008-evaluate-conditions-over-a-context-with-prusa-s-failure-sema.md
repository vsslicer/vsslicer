---
id: 8
title: "Evaluate conditions over a context with Prusa's failure semantics and a fuzz test"
type: feature
priority: P0
effort: M
model: sonnet
area: [evaluator]
story: US3
milestone: "VSS:M2"
depends_on: [7]
created: 2026-10-25
---

`evaluate(expr, context)` returns a boolean; an unparsable condition returns compatible plus a diagnostic, as PrusaSlicer does.

**Code:** `vsslicer/modules/profile-api/src/domain/conditions/evaluate/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] `evaluate` returns the expected value for every operator over a context holding `printer`, `nozzle`, `surface`, `feeder`, `material`, `process`
- [ ] A parse failure returns `{compatible: true, diagnostic}` (matches `Preset.cpp:390-421` behaviour) and never throws
- [ ] A fuzz test of 10 000 random inputs never throws outside the module's own error type
- [ ] Regex literals run with a length cap on the input so a pathological pattern cannot hang the test

## Tasks

- [ ] Write the evaluator
- [ ] Add the failure semantics
- [ ] Add the fuzz test

## Progress

Not started.
