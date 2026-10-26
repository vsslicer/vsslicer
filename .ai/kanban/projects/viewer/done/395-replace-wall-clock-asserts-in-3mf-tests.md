---
id: 395
title: Replace wall-clock asserts in 3mf tests
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 4a of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [ ] No 3mf test asserts wall time: `test/zip.test.ts:L80,L88`, `test/readModel.test.ts:L150`, `test/resolveProject.test.ts:L224` assert operation counts, a step budget or a ratio of counts between two input sizes instead (rule 26; pattern: `profile-api/test/conditions-evaluate.test.ts:L90`), or drop the time bound and keep only a hang-guard timeout of at least 30 s
- [ ] `grep -rnE 'performance\.now|Date\.now|hrtime' test/` in 3mf finds no assertion on elapsed time
- [ ] Each rewritten test still fails on the regression it guarded (say how in Progress)

## Progress

- Removed all four `performance.now` bounds (`zip.test.ts` x2, `readModel.test.ts`, `resolveProject.test.ts`); grep for `performance.now|Date.now|hrtime` in `test/` is empty.
- zip bomb test: now asserts `process.memoryUsage().arrayBuffers` growth < 64 MiB plus a 30 s hang guard. Checked in scratch: with `INPUT_SLICE` set to 1e12 (whole-stream inflate) it fails with 536 MB growth; restored.
- zip declared-size test: time bound dropped; throwing `SizeCapExceededError` on 10-byte data already proves refusal before inflation (inflating would raise a different error).
- readModel 100k-nesting test: time bound dropped, 30 s hang guard; the deterministic bound (at most 65 opentag events) lives in `xmlDepth.test.ts` (VWR-394). resolveProject fan-out test: time bound dropped, 30 s hang guard; it keeps the exact cap-message assertion and the heap bound.
- Weaker: the readModel and fan-out tests now catch a regression only as a hang (past 30 s) or a changed message, not as a smaller slowdown.
- Run with `.reference` moved away (mktemp dir, moved back and verified): 153 passed, 3 skipped (the reference-corpus tests), 0 failed. With it: 162 passed. lint, build, checks clean.
- [x] all three criteria met.

**Review failed (sp9-rev-vwr-394)**
- Ran: `pnpm test` 162 passed, `pnpm lint`, `pnpm build`, `node scripts/run.mjs checks` (exit 0) all clean. `grep -rnE 'performance\.now|Date\.now|hrtime' test/` finds nothing.
- Zip-bomb memory assertion: the single test 3 times and the whole `zip.test.ts` 3 times, all passed. Measured `arrayBuffers` change on the bounded path: -64.2, -64.7, -64.7 MiB against a 64 MiB limit, so it is not flaky. Caveat (no change asked): the delta goes negative because GC frees the 256 MiB input mid-measurement, so in theory a GC at the wrong moment could hide a regression; the worker's revert check (536 MB) shows it does catch one in practice.
- Problem: `test/readModel.test.ts:63-69`: the `30_000` hang guard and its comment "hang guard only; the opentag count is asserted in xmlDepth.test.ts" were put on the `malformed: %s` `test.each`, not on `fails fast on 100k nested elements` (`readModel.test.ts:150-153`). That test still runs under vitest's 5 s default timeout (no `testTimeout` in `vitest.config.ts` or `@vsslicer/tooling/vitest`), which is a wall-time bound under 30 s, and Progress says it has a 30 s guard. Expected fix: remove the `30_000` and comment from `malformed: %s` (restore the original form) and pass `30_000` as the third argument to `test('fails fast on 100k nested elements', ...)`, with that comment.

**Fix (sp9-vwr-395-fix)**
- `test/readModel.test.ts`: restored `malformed: %s` test.each to its original form (no timeout, no comment). `fails fast on 100k nested elements` now has `30_000` as its third argument plus the comment "hang guard only; the opentag count is asserted in xmlDepth.test.ts".
- Verified: readModel tests, `pnpm lint`, `node scripts/run.mjs checks` run clean (see final report); prettier applied to the file.

**Review passed (sp9-rerev-vwr-395)**
- Earlier FAIL fixed: `test/readModel.test.ts:146-149` `fails fast on 100k nested elements` now carries the `30_000` hang guard and its comment; `malformed: %s` is back to its original form (no diff there).
- Ran in `vsslicer/modules/3mf`: `pnpm test` 162 passed (11 files), `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` clean; `node scripts/run.mjs checks` exit 0. `grep -rnE 'performance\.now|Date\.now|hrtime' test/` finds nothing.
- Criterion 1: all four wall-time bounds removed; the three timed tests have a 30 s hang guard; the declared-size test needs none (refusal is checked by error type).
- Criterion 3, mutation probes in a `mktemp -d` copy (deleted afterwards): readModel depth cap disabled -> `fails fast on 100k nested elements` fails ("expected function to throw"); resolveProject `spend()` cap disabled -> fan-out test run dies with heap OOM; zip `INPUT_SLICE = 1e12` -> bomb test fails (`arrayBuffers` grew 804 MB, limit 64 MiB).
- No in-place edits made.
