---
id: 178
title: Make the regex timing tests independent of machine load
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP7"
owner: sp7-prf-a
docs: [.ai/audits/SP6-audit.md]
created: 2026-10-26
---

Module: profile-api (tests). Finding 5 of the SP6 audit, `.ai/audits/SP6-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] Fixed as the audit describes
- [x] A test that fails before the fix

## Tasks

- [x] Fix as the audit describes

## Progress

Done: the three wall-clock assertions are gone. `compileRegex` testers take an optional `RegexStats {states, steps}` hook; the table and largest-NFA tests assert `steps <= 4 * states * (subject length + 1)`. The instant-reject test lost its timing assertion (rejection happens at compile, nothing to count).
Files: `src/domain/conditions/evaluate/regex.ts`, `test/conditions-evaluate.test.ts`.
Verified: `pnpm lint && pnpm test && pnpm build` in profile-api pass (279 tests). Probe (scratch): changing the closure dedupe so each add call gets a fresh generation makes the suite fail (blow-up; run did not finish within 110 s), original passes.
Not done: nothing. Shared-file changes: none.

Review (sp7-rev-prf): PASS. Checked the diff of `src/domain/conditions/evaluate/regex.ts` and `test/conditions-evaluate.test.ts` against SP6 audit finding 5: no wall-clock assertion left. Hook: optional second argument, every use guarded by `if (stats)`, so with no argument there is no behaviour change and the only cost is one falsy check per step. The only caller (`evaluate.ts:35,106`) is typed and called with one argument. `RegexStats`/`compileRegex` are not reachable from `src/index.ts` (`evaluate.ts` re-exports only `MAX_REGEX_STATES`). Bound: worked from the code, each position's closure marks each state once; pops <= add calls + 2*splits + asserts, add calls <= char states in the list, plus one list step per char state, so steps <= 3*states per generation, over n+1 generations. 4*states*(n+1) is a real guarantee. Probes in /private/tmp/claude-501/sp7w.DRAE/prf178 (copies of regex.ts, src untouched): original ratio steps/(states*(n+1)) is 0.2 to 1.8 on the test patterns; a quadratic mutation (re-simulating every prefix) gives ratios 40 to 456 and FAILs the bound in 1 to 541 ms, so it fails fast, not by timeout; the broken-dedupe (exponential) mutation dies with RangeError almost at once. `pnpm lint` is clean (the reported regex.ts:193,204 errors don't reproduce; they were probably from an earlier state of the file), `pnpm test` has 279 passing, `pnpm build` passes. Non-blocking: the bound is an upper bound only, so an engine rewrite that stopped counting steps (steps stays 0) would pass; `expect(stats.steps).toBeGreaterThan(0)` would close that.
