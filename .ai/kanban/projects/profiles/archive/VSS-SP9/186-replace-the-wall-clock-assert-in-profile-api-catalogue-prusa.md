---
id: 186
title: Replace the wall-clock assert in profile-api catalogue-prusa test
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 4c of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] `profile-api/test/catalogue-prusa.test.ts:L228` (3 s per tokenizer case) asserts a step or operation count, or a count ratio between two input sizes, instead of wall time (rule 26; pattern `test/conditions-evaluate.test.ts:L90`)
- [x] `grep -rnE 'performance\.now|Date\.now|hrtime' test/` in profile-api finds no assertion on elapsed time
- [x] The test still fails on a quadratic tokenizer (say how in Progress)

## Progress

Replaced every elapsed-time assertion in the profile-api tests with a hang guard in a child process.

- New `test/support/guard.ts`: `guarded(body, src)` runs the scan in a child node process with `spawnSync` `timeout` (60 s) and throws if the child is killed or crashes; no clock is read in the test. It returns `Name: message` of a thrown error so tests still match the error text.
- Converted: `catalogue-prusa.test.ts` (the `fast` helper, the Orca/Bambu path, the #define test, the .ui/vendor test), `catalogue-groups.test.ts` (tabPlaces scan), `catalogue-cura.test.ts` (100k flat settings; the child also checks the count and last key/line), `mappings.test.ts` and `printer-instance.test.ts` (both also had `performance.now`/`Date.now` asserts, needed for criterion 2).
- `grep -rnE 'performance\.now|Date\.now|hrtime' test/` finds nothing. `pnpm test` 709 passed, eslint on test clean, prettier run on changed files, `node scripts/run.mjs checks` passes.
- Quadratic detection: the inputs are 4 MB / 100k-300k statements; a quadratic scanner needs 1e10-1e13 steps there, far past the 60 s kill. I verified the guard kills a hang (`while(true){}` with a 1.5 s limit gives "child did not finish"). I did not run a real quadratic tokenizer against it; the weakest case (200k unclosed add calls, about 4e10 steps if quadratic) is the least certain to exceed 60 s.
- Not done: no operation counters in the tokenizer (would touch tools code in many places); the bound is a hang guard, as rule 6 allows.

**Review failed (sp9-rev-prf-186)**

Ran: `pnpm test` (721 passed, 2 failed: test timeouts on a loaded machine, load average about 200), `pnpm lint` clean, `pnpm build` ok, `node scripts/run.mjs checks` exit 0. `grep -rnE 'performance\.now|Date\.now|hrtime' test/` finds nothing (criterion 2 met). `vitest run test/catalogue-prusa.test.ts` alone: 1 failed then 30/30 passed.

Criterion 3 checked with a mutant in a `mktemp -d` copy: the tokenizer recounts newlines from offset 0 at every token, which makes it quadratic. With `--testTimeout=200000`, 7 of the 11 "linear time" tests fail with `child did not finish ... ETIMEDOUT` at 60 s, so the guard does catch a quadratic tokenizer. A regression costs about 7 minutes of CI before it fails, which is acceptable for a failure path. Each child takes about 0.5 s to start, about 13 s of CPU across the 8 `guarded` calls in 5 files. That cost is acceptable.

Problem (flakiness, rule 4: a wall-time bound under 30 s):
- `test/support/guard.ts:28` uses `spawnSync`, which blocks the worker until the child exits. No test that calls `guarded` sets a timeout, so vitest's default 5 s `testTimeout` applies after the fact. The real bound is 5 s of wall time for the whole test, not the 60 s guard. The test at `test/catalogue-prusa.test.ts:235` spawns 3 children and failed at 5232 ms in the full suite and at 5597 ms when its file ran alone. The same applies to `catalogue-cura.test.ts`, `catalogue-groups.test.ts`, `mappings.test.ts` and `printer-instance.test.ts`.
  Expected fix: give every test or describe that calls `guarded` a vitest timeout above the hang guard, for example `{ timeout: 120_000 }` on the describe blocks, or a constant exported from `guard.ts` set to the number of children times `hangMs` plus a margin. Spawning one child per test would also help.

**Fix after the review FAIL (sp9-prf-186-fix)**

- `test/support/guard.ts` exports `GUARDED_TIMEOUT = 300_000` (above the 60 s hang guard times the 3 children the busiest test spawns). Every `test(...)` that calls `guarded` or the prusa `fast` helper now passes it as its timeout: 15 tests across `catalogue-prusa`, `catalogue-groups`, `catalogue-cura`, `mappings`, `printer-instance`.
- `conditions-evaluate.test.ts` "every vendor profile regex matches exactly as RegExp ..." timed out at the default 5 s (8 s under load); it now has a 60 s hang guard.
- Verified: `pnpm test` twice, 723 passed both times; `pnpm lint` clean; `node scripts/run.mjs checks` exit 0.

**Review passed (sp9-rerev-prf-186)**

Re-review of the earlier FAIL. Ran in `vsslicer/modules/profile-api` (load average 14-27): `pnpm test` twice, 723/723 passed both times (11.2 s, 9.5 s); `pnpm lint` clean (eslint, prettier, tsc); `pnpm build` ok; `node scripts/run.mjs checks` exit 0. `grep -rnE 'performance\.now|Date\.now|hrtime' test/` finds nothing.

- Earlier FAIL fixed: `test/support/guard.ts` exports `GUARDED_TIMEOUT = 300_000` (above 3 children x 60 s). Every test that calls `guarded` or the prusa `fast` helper passes it: 11 in `catalogue-prusa`, 1 each in `catalogue-groups`, `catalogue-cura`, `mappings`, `printer-instance` (checked by grep, one timeout per guarded test). `conditions-evaluate.test.ts:189` has a 60 s hang guard. No bound under 30 s is left.
- Criteria 1-2 met; criterion 3 was shown by the earlier review's quadratic-tokenizer mutant (7 of 11 tests fail at the 60 s guard). `guard.ts` is unchanged since, so that result still holds.
- Minor, not blocking: the two lambda tests now match on the message only, no longer `toBeInstanceOf(SourceLimitError)`; the messages are specific enough.
