---
id: 197
title: Swap generated data into place by rename in profiles-data-orca generate.mjs
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 10 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

generate.mjs already staged into `data.tmp`; the remaining gap was `rmSync(data)` then `cpSync(tmp, data)`. Now: rename data -> data.old, rename tmp -> data, restore old on failure, clean tmp/old in finally. Injectable `rename` option. Bounds unchanged (caps run before staging; existing hostile tests still pass). Test: injected failure on the second rename keeps old data/ and leaves no .tmp/.old. Mutation probe: removing the restore makes the test fail. Verified: lint, build, test (20 passed), run.mjs checks pass. Real generator not run; shipped data untouched.

**Review passed (sp10-rev-prf-197-plt-198)**

Ran in `profiles-data-orca`: `pnpm install` (ok), `pnpm lint` (eslint, prettier, tsc clean), `pnpm build` (ok), `pnpm test` (2 files, 20 passed); `node scripts/run.mjs checks` passed. Real generator not run against `.reference`.
Fix matches finding 10 and goes one step further than the audit's `rmSync` + `renameSync`: rename `data/` aside, rename the stage in, restore on failure. Both folders are siblings, so no cross-device rename.
Mutation probes (temporary, restored, `cmp` clean): (a) put back the old `rmSync(out)` + `cpSync(tmp, out)` swap: the swap test fails; (b) drop the restore `renameSync(old, out)`: fails; (c) drop `rmSync(old)` from `finally`: all 11 generate tests still pass (see note 1).
Bounds: the caps run before staging and are unchanged; the existing hostile tests pass.
Fixed in place: added the missing CHANGELOG line under `## Unreleased` (no behaviour change).
Notes, not blocking:
1. `test/generate.test.ts` never asserts that `data.old` is gone after a *successful* run, so the cleanup that removes a full second copy of the data is untested. Fix: add `expect(existsSync(\`${out}.old\`)).toBe(false)` after the final `go()`.
2. `scripts/generate.mjs` `finally` deletes `data.old` even when the restore rename itself failed. Only happens if a same-directory rename fails twice, and the data can be regenerated. `.gitignore` covers `data/` but not `data.old/` or `data.tmp/`, which only matters if the process is killed mid-swap.
