---
id: 58
title: "Evaluate the AST: operators, conditionals, `math.*` and container access"
type: feature
priority: P1
effort: M
model: sonnet
area: [cura]
story: US13
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [57]
created: 2026-10-25
---

Pure evaluator over a value-lookup interface; Python semantics for the subset (integer and float division, truthiness, `and`/`or`, conditional expressions, lists).

**Code:** `vsslicer/modules/cura-settings/src/domain/...` (module: `cura-settings`, layer: `domain`)

## Acceptance criteria

- [ ] Table-driven tests of operators including Python-specific cases (`/` is float, `//`, `%` on negatives)
- [ ] `math.*` functions from the survey are supported; an unknown name fails with the key and the function named
- [ ] No `eval` or dynamic code execution is used (lint rule or test)

## Tasks

- [ ] Evaluator
- [ ] Python semantics tests
- [ ] Unknown name errors

## Progress

Not started.
