---
id: 403
title: "Test the p:path refusal on a PrusaSlicer 2.x build item"
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 8 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

**Record (sp12-coordinator, from sp12-vwr-403's report and sp12-rev-vwr-401's verified probe):** the worker's Progress
edit did not reach this file.
- Criterion 1: new row in `vsslicer/modules/3mf/test/readPrusa2.test.ts:301-305`, a `p:path` on a build item expects
  `/production paths/`. Probe: dropping `item.path` at `src/adapters/prusa/readPrusa2.ts:152` fails exactly that row
  (worker and reviewer each ran it; restored).
- Criterion 2: test only; no input handling changed, so no bound applies.
- Verify (macOS): 3mf lint, build, test 22 files / 358 tests, `node scripts/run.mjs checks` exit 0.
- Release lines: none.

**Review failed (sp12-rev-vwr-401)**

The code is right: `test/readPrusa2.test.ts:301-305` adds the audit's row (`<build><item objectid="1"
p:path="/3D/o.model"/></build>` expects `/production paths/`). Ran in `vsslicer/modules/3mf`: lint, build clean;
`pnpm test` 22 files / 358 pass; `run.mjs checks` exit 0. Reviewer probe: dropped `item.path` from the build-item
`place` call in `src/adapters/prusa/readPrusa2.ts:152` (restored): exactly that row fails.

Problems:
1. The card says "Not started": Progress is empty and both criteria are unchecked, so neither criterion has a probe
   or a verify line. Rule: every acceptance criterion carries its probe in Progress. Fix: write Progress (the test
   location, the `item.path` mutation probe and its result, "test only, no bound applies" for criterion 2, verify
   counts, release lines: none) and tick the criteria. No code change needed.
