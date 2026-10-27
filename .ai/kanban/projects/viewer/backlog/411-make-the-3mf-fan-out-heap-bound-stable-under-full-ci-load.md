---
id: 411
title: Make the 3mf fan-out heap bound stable under full-CI load
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP15"
created: 2026-10-27
---

`vsslicer/modules/core/3mf/test/resolveProject.test.ts` "component fan-out bounds (rule 25) > the 8-level fan-out is refused fast and without a heap blow-up" failed once during `node scripts/run.mjs ci` (2026-10-27, PLT-204 verification): `expected 105733776 to be less than 104857600`. It passes 3 of 3 alone.

Module: `3mf`, layer: test (adapters under test).

Done when: the bound measures the fan-out's own allocation (e.g. `global.gc()` before the baseline, or a delta against a measured baseline), not process-wide heap noise, and still fails when the fan-out cap is removed (mutation probe recorded).