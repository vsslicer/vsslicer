---
id: 405
title: "Cap the Bambu reader's notices"
type: bug
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 12 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Capped the Bambu reader's missing-component notices at MAX_NOTICES (1,000) plus one "N more notices suppressed." line (`3mf/src/adapters/bambu/readObjects.ts`). Test: `test/readBambuObjects.test.ts`, rows at cap (no extra line), cap+1 (1 suppressed), cap+500 (500 suppressed); counts, no wall time.

Probes: criterion 1 (fix): removing the cap guard (`notices.length < MAX_NOTICES` -> `true`) fails the cap+1 and cap+500 rows. Criterion 2 (bounds, exact cap): loosening to `<=` fails the same rows. Both restored.

Verification (3mf, macOS): pnpm install, lint, build clean; test 22 files, 365 tests pass; `node scripts/run.mjs checks` passes.

Release lines:
- CHANGELOG: Fixed: the Bambu reader keeps at most 1,000 missing-component notices and adds one "N more notices suppressed." line.
- Export lines: none (MAX_NOTICES is exported from readObjects.ts for tests only).

**Review failed (sp12-rev-vwr-405)**

Ran (3mf, macOS): pnpm install, lint (eslint, prettier, tsc) and build clean; pnpm test 22 files, 365 tests pass. `node scripts/run.mjs checks` fails, but only on `modules/profiles-orca: node_modules holds only declared dependencies`, which is outside this card; 3mf passes.

Code: the fix matches audit finding 12. There is one notice source in `readObjects.ts` (L168-L172), capped at 1,000, plus one "N more notices suppressed." line at L236. The layering is fine (adapter, no VS Code, no cross-module imports). No input-keyed objects are added, so the `__proto__` check does not apply.

Probes (temp copy of the module, test/readBambuObjects.test.ts, 24 tests):
- P1, guard removed (`else if (true)`): 2 fail. Criterion 1 holds.
- P2, `<` loosened to `<=`: 2 fail.
- P5, summary line dropped: 2 fail.
- P3, cap changed `MAX_NOTICES = 1000` to `10`: **all 24 pass**.
- P4, cap changed to `100_000`: 2 fail, but only because 101,000 components trip `MAX_COMPONENTS`, not because a test checks the cap.

Problems:
1. `test/readBambuObjects.test.ts:214-223`: every expected count comes from `MAX_NOTICES`, the constant in the code under test, so the test never pins the audit's cap of 1,000. P3 shows this. That breaks the SP12 rule "a bound's test must assert the exact cap; an expected value taken from the code under test is a FAIL". Fix: write the expected values as literals (rows `[1000, 0]`, `[1001, 1]`, `[1500, 500]`, lengths `1000`/`1001`), or add `expect(MAX_NOTICES).toBe(1000)`. Then P3 must fail.

**Coordinator fix and re-review (sp12-coordinator, rule 29):** the test now pins the cap as literals (1000, 1001, 1500) and asserts `MAX_NOTICES` is 1000; probe `MAX_NOTICES = 10` fails 3 of 24, restored. Pass.
