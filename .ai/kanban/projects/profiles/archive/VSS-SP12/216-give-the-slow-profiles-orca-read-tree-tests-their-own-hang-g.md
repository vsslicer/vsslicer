---
id: 216
title: Give the slow profiles-orca read-tree tests their own hang-guard timeouts
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 9 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Edited `vsslicer/modules/profiles-orca/test/read-tree.test.ts`: "the default merge budget stops a fan-out" now has an explicit 30_000 ms hang guard. The two golden-count tests already had 60_000 (no change). The 3mf test is not in this card's module.
- Criterion 1 probe: a timeout is not countable behaviour; probe = removing the `30_000` argument restores the 5 s default (diff-visible). The test still asserts the operation-count bound (`codes == ['limit']`, presets <= maxMergeSteps/20000).
- Criterion 2: no input handling changed; the existing limit test is untouched and passes.
- Verify: profiles-orca build ok, test 161 passed (11 files), `node scripts/run.mjs checks` exit 0. `pnpm lint` fails only on prettier of untracked `test/fixtures/bundles/PROVENANCE.md` (another card's file), not mine. CI gate platform: Linux/macOS.
Release lines: none.

**Review passed (sp12-rev-prf-105)**
- Ran in profiles-orca: `pnpm install` ok, `pnpm lint` pass (the PROVENANCE.md prettier failure noted above is gone), `pnpm build` ok, `pnpm test` 11 files / 161 tests pass; `node scripts/run.mjs checks` exit 0.
- Criterion 1 against SP11 audit finding 9 (fix: own `30_000` timeout on the profiles-orca "default merge budget stops a fan-out" and "golden counts" tests): `test/read-tree.test.ts:247` now `}, 30_000);`; the two golden-count tests already carry `60_000` (lines 384, 397), which meets the hang-guard intent. The 3mf test is VWR-404's.
- Probe: set the fan-out timeout to `1`, the test failed "Test timed out in 1ms", so the per-test argument is in force over the 5 s default; restored, passes. No wall-time assert added (rule 26).
- Criterion 2: the bound assertions (`codes == ['limit']`, presets <= `TREE_LIMITS.maxMergeSteps / 20_000`) are unchanged; no input handling touched.
