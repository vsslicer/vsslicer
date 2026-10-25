---
id: 9
title: "Apply overrides[] blocks with match first or all"
type: feature
priority: P0
effort: S
model: sonnet
area: [schema, evaluator]
story: US2
milestone: "VSS:M2"
depends_on: [6, 8]
created: 2026-10-25
---

Selects the `overrides` blocks of an entity whose `when` holds for a context and merges them, like PrusaSlicer 3.0 `variants`.

**Code:** `vsslicer/modules/profile-api/src/domain/inheritance/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] `match: first` applies only the first true block; `match: all` applies every true block in order
- [ ] The example `nozzle.diameter == 0.6 and nozzle.flow == 'high_flow'` applies only for that nozzle
- [ ] An unparsable `when` skips nothing silently: the block is applied and a diagnostic is returned

## Tasks

- [ ] Write applyOverrides
- [ ] Write the tests

## Progress

Not started.
