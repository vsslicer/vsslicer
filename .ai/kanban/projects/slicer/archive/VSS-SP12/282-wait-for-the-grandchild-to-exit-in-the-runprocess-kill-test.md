---
id: 282
title: Wait for the grandchild to exit in the runProcess kill test
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 10 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Test-only change in slicer-runtime/test/run-process.test.ts: after runProcess resolves, poll `process.kill(pid,0)` up to 50 steps x 20 ms for ESRCH (step count, not wall time), then assert. Other errno codes rethrow.
- Probe, criterion 1 (fix): replaced the grandchild pid with the live test process pid; the test fails after 50 polls. (The original race is not deterministic, so it cannot be reproduced on demand.)
- Probe, criterion 2 (bounds): the poll is capped at 50 steps; the same live-pid probe shows the loop ends and fails rather than hanging. Input is a pid from our own child, no new parsing.
- Verified in slicer-runtime: install, lint, build clean; test 80 passed, 1 skipped; `node scripts/run.mjs checks` passes. CI gate platform: Linux and macOS (test skipped on win32).
Release lines: none (test only).

**Review passed (sp12-rev-prf-217)**
- Ran in slicer-runtime: `pnpm install --frozen-lockfile`, lint, build clean; test 80 passed, 1 skipped (4 files). `node scripts/run.mjs checks` passed.
- Audit fix matches finding 10: the test polls `process.kill(pid, 0)` up to 50 times, 20 ms apart, and stops on `ESRCH`. Any other errno is rethrown. The final assert is on the outcome, not on elapsed time. Production code is unchanged, as the audit says.
- Mutation probe (behaviour): in a temp copy, disabled the group kill at `src/adapters/run-process.ts:131` so only the shell is killed. The test failed and the grandchild survived; I cleaned up the stray `sleep 1000` afterwards. The author's live-pid probe covers the poll cap: the loop ends after 50 steps and fails rather than hanging.
- Flake check (macOS): the fixed test passed 25 out of 25 runs. The original single-shot assert also passed 25 out of 25 here, so the race does not reproduce on this machine, as the card says.
- Bounds: no input is parsed. The pid comes from our own child, and the loop is capped at 50 steps under the existing `GUARD` test timeout.
