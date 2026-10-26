---
id: 21
title: Run klipper_estimator as a black-box oracle in CI
type: chore
priority: P0
effort: M
model: sonnet
area: [planner]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [20, 2]
created: 2026-10-25
---

Oracle for the Klipper bar: within 1 minute over 12 hours of klipper_estimator@dbcff4a output.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] CI builds klipper_estimator from source (not shipped) or uses pinned recorded outputs with its commit hash if build time is too long, and compares totals on the corpus plus synthetic 12 h-class files for the same `printer.cfg` JSON
- [ ] The test fails when the difference exceeds 1 minute per 12 hours

## Tasks

- [ ] Build or pin the oracle
- [ ] Printer.cfg JSON per fixture
- [ ] Compare test
- [ ] Cache the binary

## Progress

Not started.
