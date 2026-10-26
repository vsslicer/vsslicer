---
id: 400
title: Collect worker transfer buffers without spreading into push (3MF worker crash on painted objects)
type: bug
priority: P0
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 1 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Fixed `collectBuffers` (3mf/src/adapters/worker/handle.ts): both `push(...)` spreads replaced by loops. Test in test/worker.test.ts: 200,000-item array, Set and object (buffer at the tail).
Probes: criterion 1 - restoring `stack.push(...v)` makes the new test fail with RangeError (confirmed, 1 failed/16 passed). Criterion 2 (bounds) - MAX_VISITED and the visited/seen logic are untouched; the new test is the hostile 200k-item case on array, Set and object.
Verify (3mf): lint ok, build ok, test 315 passed (20 files); `node scripts/run.mjs checks` passed. Gate platform: darwin local.
Release lines:
- CHANGELOG: Fixed: the worker no longer crashes with a stack overflow when a result holds more than about 125,000 items in one array, set or object (painted Bambu/Orca objects).
- Exports: none.

**Review passed (sp12-rev-vwr-400)**

- Ran in the shared tree (3mf): install ok, build ok; lint 1 error (`FILE_KEYS` unused), tests 2 failed / 322 passed,
  checks 1 problem (`readPlates.ts` ported-copyright). All three come from other in-flight cards' uncommitted files
  (readPlates.ts, readModelOnce.ts, test/large/), not from this card.
- Isolated: HEAD copy of 3mf (`git archive`) plus only this card's `handle.ts` and `test/worker.test.ts`: install,
  lint, build ok; tests 301 passed / 4 skipped (19 files).
- Fix matches audit finding 1: both spreads replaced by loops (handle.ts:23-25); the 200,000-item test is the one the
  audit asks for, extended to Set and object. Adapters layer, no cross-module imports.
- Mutation probes (worker.test.ts, 17 tests): restoring `stack.push(...v)` alone -> 1 failed, RangeError; restoring
  `stack.push(...Object.values(v))` alone -> 1 failed, RangeError. Each branch is covered independently.
- Hostile probes (scratch test, deleted): `__proto__` (as own enumerable key and via JSON.parse) and `constructor` keys
  plus a self-cycle -> all 3 buffers found, no hang. With MAX_VISITED patched to 10: 10 visited passes, 11 throws
  RangeError, 300,000 primitives pass (they are not counted). The cap logic is exact and unchanged by the fix.
- Bounds criterion: the audit names no new limit; MAX_VISITED is untouched. Note for the coordinator: no existing test
  pins MAX_VISITED (raising it to 50,000,000 keeps all 17 worker tests green); a pre-existing gap, not this card's.
