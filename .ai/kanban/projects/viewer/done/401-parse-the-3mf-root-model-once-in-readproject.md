---
id: 401
title: Parse the 3MF root model once in readProject
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 5 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Module 3mf, adapters. New `src/adapters/model/readModelOnce.ts`: `readModel` memoised in a WeakMap keyed by the bytes
(identity) plus part name; failures are not cached; nothing outlives the bytes. `readProject.ts` (metadata),
`readPrusa2.ts`, `readObjects.ts` (bambu) and `resolveProject.ts` (core) now call it. Test `test/readModelOnce.test.ts`
counts calls to the real `readModel` through a vi.mock spy (operation counts): same bytes parse once; each real fixture's
`readProject` makes at most one parse per .model part.

Probes (criterion 1, the fix): remove the cache hit return -> 6 tests fail (same-bytes test and the fixture count tests).
Remove the `parsed.set` -> same failures. Bounds (criterion 2): cache is identity-keyed and weak, no new input is parsed
or sized, so the limits of `readModel` are untouched; hostile tests: equal content in other bytes is reparsed, a different
part name is reparsed (probe: drop the part check -> that test fails), a failed parse is not cached and rethrows.

Verify: pnpm lint, build clean; pnpm test 21 files / 324 tests pass; `node scripts/run.mjs checks` pass. CI gate platform: linux.

Release lines:
- CHANGELOG: Fixed: readProject parses the root model once instead of two or three times (readModelOnce, shared by dialect detection, readers and the core fallback).
- Exports: none.

**Review failed (sp12-rev-vwr-401)**

Ran in `vsslicer/modules/3mf`: `pnpm install` ok, `pnpm lint` clean, `pnpm build` clean, `pnpm test` 22 files / 353
tests pass. `node scripts/run.mjs checks` fails, but only on `src/adapters/bambu/readPlates.ts:15` ("Ported from"
without a Copyright line), a file of another card, not this one. Layering fine (adapters only, no cross-module imports).
The fix matches the audit (finding 5: a WeakMap keyed by the bytes), and all four call sites use it.

Probes (all restored after):
- Cache hit return disabled: 7 tests fail (the same-bytes test and 6 of 7 fixture cases). `auto_pa_line_single.3mf` still passes.
- Part check dropped (`if (hit)`): "another part name is parsed again" fails. Good.
- Failure cached and rethrown: "a failed parse is not cached" fails. Good.
- Per-fixture parse counts, from a scratch spy test (deleted). Cached: core 1/1/2, bambu 1/2/2, prusa2 1, root parsed
  once everywhere. Uncached: root parsed twice everywhere. No fixture takes the reader-fails fallback (0 notices).

Problems:
1. `test/readModelOnce.test.ts:61` `expect(calls.n).toBeLessThanOrEqual(models)` cannot fail for
   `auto_pa_line_single.3mf`. It has 5 `.model` parts and only 2 are read, so the unfixed code's 3 parses (root twice)
   still pass. The case is named "parses each root model once" but never checks that. Rule: an operation-count test
   asserts the exact count, not a loose cap. Fix: record the part names in the spy and assert each name is parsed
   exactly once (root count `=== 1`, no duplicates). Do not compare the total with the part count.
2. The audit's third parse, on the path where the reader fails and readProject falls back to core, has no test.
   Fix: add one case that goes through the fallback, e.g. `createReadProject` with the real `readMetadata` and
   `readCore` and a reader that calls `readModelOnce` and then throws. Assert the root is parsed once and a notice is
   present. Its probe: the same cache-hit removal must fail it.

**Rework (sp12-vwr-401b)**

Only `test/readModelOnce.test.ts` changed. The spy now records part names. Problem 1: each fixture case asserts the root
model is parsed exactly once (`names.filter(root)` length 1) and that no part is parsed twice (unique names); the loose
cap against the part count is gone. Problem 2: new case "also when the dialect reader fails and the core read is the
fallback": `createReadProject` with the real `readCore`, a `readMetadata` through `readModelOnce`, and readers that call
`readModelOnce` then throw, on the first non-core fixture; asserts the notice `its reader failed: boom` and the root parsed once.

Probe (cache-hit return removed): 9 tests fail, including every fixture case (auto_pa_line_single too) and the fallback
case. Source restored.

Verify: pnpm lint, build clean; pnpm test 22 files / 357 tests pass (one run had an unrelated 5 s timeout in
readModel.test.ts 3DBenchy under load, passed on rerun); `node scripts/run.mjs checks` pass. CI gate platform: linux.
Release lines: unchanged from above.

**Review passed (sp12-rev-vwr-401)**

Rework checked against the previous review. Ran in `vsslicer/modules/3mf`: `pnpm install` ok, `pnpm lint` clean,
`pnpm build` clean, `pnpm test` 22 files / 358 tests pass; `node scripts/run.mjs checks` exit 0. No direct `readModel(`
call left in `src/` outside `readModelOnce.ts`; adapters layer only, no cross-module imports.

- Problem 1 fixed: each fixture case asserts the root part is parsed exactly once and no part name repeats; no loose cap.
- Problem 2 fixed: the fallback case goes through `createReadProject` with the real `readCore` and failing readers,
  asserts the `its reader failed: boom` notice and one root parse.
- Probe (cache-hit return removed, restored): 9 of 11 fail, every fixture case including `auto_pa_line_single.3mf`,
  the fallback case and the same-bytes case. Earlier probes (part check dropped, failure cached) still hold per the
  first review; the WeakMap is identity-keyed, so `__proto__`/`constructor` keys do not apply.
