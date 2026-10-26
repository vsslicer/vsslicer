---
id: 204
title: Cap the diagnostics of the Orca tree reader and folder loader
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 4 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done. read-tree.ts: `MAX_TREE_DIAGNOSTICS = 1000` and `pushCapped` (1000 diagnostics plus one "further diagnostics suppressed"); both `report` functions use it. load-tree.ts: every directory entry counts against `maxFiles` (as profiles-cura folder.ts:52); the first one over the cap reports once and stops.
Tests (test/read-tree.test.ts, counts only): 30 presets x 64 missing includes give exactly 1001 diagnostics; 30 links + 30 .txt with maxFiles 10 give at most 11 diagnostics ending in "folder entries".
Mutation probes: removing the cap guard in pushCapped fails the first test; replacing the entry-count check with `if (false)` fails the second. Both restored.
Verification (local darwin; CI gate runs ubuntu): module tests 126/126 pass, build ok, eslint and prettier clean on my files. Whole-module `pnpm lint` fails only on test/write-json.test.ts:227 (unused `_`, another card's file). `run.mjs checks` showed no failures.
Release lines:
- CHANGELOG: Orca tree reader and folder loader cap diagnostics at 1,000 (plus one suppressed line) and count every folder entry against maxFiles (PRF-204).
- Export (optional): `MAX_TREE_DIAGNOSTICS` from ./adapters/tree/read-tree.ts.

**Review failed (sp11-rev-prf-204)**
Ran (profiles-orca, darwin): `pnpm install` ok; `pnpm build` ok; `pnpm test` 155/157, the 2 failures are in untracked test/tuples/tuples.test.ts (another card); `vitest run test/read-tree.test.ts` 27/27. `pnpm lint` fails only on prettier for test/tuples/* (another card); eslint, prettier and `tsc -p tsconfig.test.json` are clean on src/adapters/tree and test/read-tree.test.ts. `node scripts/run.mjs checks` exit 0.
Code matches the audit fix: both `report` functions go through `pushCapped` (1,000 + one "further diagnostics suppressed"), and every folder entry counts against `maxFiles` as profiles-cura folder.ts:52 does. Layering fine (adapters only, no cross-module imports).
Mutation probes (in place, restored, `cmp` verified): no cap guard -> fails; no suppressed message -> fails; cap `>=` (off by one) -> fails; entry check `if (false)` -> fails; loader `report` bypassing `pushCapped` -> survives (acceptable: the loader is already bounded by the entry cap, and a hostile probe of 3,000 symlinks at default maxFiles gave exactly 1,001 diagnostics, so the cap works); entry cap loosened to `maxFiles + 5` -> **survives**.
Hostile probe of the loader test's folder: with maxFiles 10 it gives 7 diagnostics (6 links + cap line), with maxFiles 15 it gives 11, because readdir interleaves `l*` links and `n*.txt` files in hash order.

1. test/read-tree.test.ts:309-321: the entry-count test does not pin the bound it names. `expect(r.diagnostics.length).toBeLessThanOrEqual(11)` passes with the cap at `maxFiles + 5` (probe above), because only some of the first entries are links and the order depends on the file system. Rule: a bound test must fail when the bound moves; make the count deterministic. Fix: a folder of only symlinks (say 30) with `maxFiles: 10`, expect exactly 11 diagnostics, the first 10 `unsafe-path` and the last "folder entries"; optionally keep the `.txt` files in a second case asserting `files` is empty and the last diagnostic is the cap line.

**Fix after review (sp11-prf-204-fix)**
Replaced the loader test in test/read-tree.test.ts with two deterministic cases: 30 symlinks only, maxFiles 10 gives exactly 11 diagnostics (first 10 `unsafe-path`, last "folder entries"); 30 stray .txt files give no files and exactly the cap line. Mutation probe: entry cap loosened to `maxFiles + 5` now fails (restored, tests 28/28, eslint and prettier clean). Platform: local darwin, CI gate ubuntu. Release lines unchanged.

**Review passed (sp11-rev2-prf-204)**
Ran (profiles-orca, darwin): `pnpm install` ok; `pnpm build` ok; `vitest run test/read-tree.test.ts` 28/28; the module without the untracked test/tuples (another card) 128/128. `pnpm lint` clean (eslint, prettier, tsc test config). `node scripts/run.mjs checks` exit 0.
Claim checked: an earlier reviewer said `pushCapped` keeps pushing every diagnostic after the cap and only rewrites the 1001st. That is wrong. `read-tree.ts:148` returns early once `length > 1000`. Probe: 5,000 calls give exactly 1,001 entries, entry 999 is the original, entry 1000 is "further diagnostics suppressed", and that line appears once. Mutation M1 does what the claim describes: with the early return deleted, the "diagnostic cap" test fails (it asserts length exactly 1,001), so the test would catch that bug.
Mutation probes (in place, restored, `cmp` verified): M1 no early return -> fails; M2 entry cap at `maxFiles + 5` -> fails (the fix-after-review test now pins the bound); M3 entry check `if (false)` -> both loader tests fail.
Hostile probe (the audit's input): 30,000 symlinks and 30,000 .txt files gave 4 diagnostics with maxFiles 10 (the audit measured 30,000), and exactly 1,001 at the defaults, ending in the suppressed line. No wall-time asserts. Layering ok (adapters only, no cross-module imports).
Note for the coordinator (not this card): the full `pnpm test` fails 2 runs in 3 on `readOrcaTree: bounds > the default merge budget stops a fan-out` (from PRF-27, not in this diff). It takes 2 to 4 s alone and goes past vitest's 5 s timeout when the untracked test/tuples suite runs alongside it.
