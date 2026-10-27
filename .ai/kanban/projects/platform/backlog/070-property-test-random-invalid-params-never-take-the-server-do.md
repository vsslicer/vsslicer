---
id: 70
title: "Property test: random invalid params never take the server down"
type: chore
priority: P1
effort: S
model: sonnet
area: [agent-protocol]
story: US43
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [55, 53]
created: 2026-10-25
---

A fast-check test generating invalid params for every registered method. Path: `vsslicer/modules/common/agent-protocol/test/property/invalid-params.test.ts` (layer: application, test).

**Code:** `vsslicer/modules/common/agent-protocol/src/application/...` (module: `agent-protocol`, layer: `application`)

## Acceptance criteria

- [ ] For every method, 1000 generated invalid param values each return `InvalidParams` and a following valid request still succeeds
- [ ] Valid values generated from the schema for the same methods are accepted (the generator is not vacuous)

## Tasks

- [ ] Add fast-check arbitraries derived from the schema
- [ ] Write the test

## Progress

Not started.
