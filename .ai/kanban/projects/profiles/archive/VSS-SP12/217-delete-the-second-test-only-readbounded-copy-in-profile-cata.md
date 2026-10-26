---
id: 217
title: Delete the second test-only readBounded copy in profile-catalogue-data
type: bug
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 14 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Deleted `readBounded`, `CURA_SOURCE`, `FDM_MATERIALS_SOURCE` and the unused `node:fs` import from `profile-catalogue-data/tools/catalogue/cura.ts` (grep of module and scripts: no user). Added `test/dead-code.test.ts` (export-name check, no timing).
- Probe, criterion 1: appended `export const readBounded = 1` to cura.ts, the new test failed; restored.
- Probe, criterion 2: the fix removes a reader and touches no input; `MAX_FILE_BYTES` and its use at cura.ts:96 are unchanged. No hostile input path left, so no hostile test.
- Verify (macOS; CI gate runs Linux): lint, build, test 26 passed (3 files), `node scripts/run.mjs checks` passed.
Release lines: none (tools only, not shipped).

**Review passed (sp12-rev-prf-217)**
- Ran in profile-catalogue-data: `pnpm install --frozen-lockfile`, lint, build clean; test 26 passed (3 files). `node scripts/run.mjs checks` passed.
- Audit fix matches finding 14: the three exports and the `node:fs` import are gone. `diff` against `profile-api/tools/catalogue/cura.ts` now shows only the expected differences (SPDX, output path, import source). A grep of `modules/`, `scripts/` and the workflows finds no user of the deleted names. (profile-api's test keeps its own local `CURA_SOURCE` const.)
- Mutation probes: appended `export const <name> = 1` to cura.ts in a temp copy, once for each of `readBounded`, `CURA_SOURCE` and `FDM_MATERIALS_SOURCE`. `test/dead-code.test.ts` failed all three times.
- Bounds: no input path changed; `MAX_FILE_BYTES` (16 MiB) and its check at cura.ts:96 are unchanged. No hostile test is needed.
- Fixed in place (no behaviour change): the line reference in the progress note (cura.ts:104 is now cura.ts:96).
