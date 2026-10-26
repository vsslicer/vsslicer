---
id: 213
title: Write Cura booleans as Python literals in exported .inst.cfg
type: bug
priority: P0
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 3 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Fix: `valueText` in profiles-cura/src/adapters/export/cura/write.ts writes booleans as `True`/`False`. Test: 'booleans are written as Python literals' in test/export.test.ts.
- Probe (fix criterion): replaced with `String(v)`; the new test failed, restored.
- Probe (Bounds criterion): the fix adds no input, loop or size path; existing maxChars/maxEntities bounds untouched and still tested (export.test.ts 10/10 pass). No new probe.
- Verification: export.test.ts 10/10 pass. Module-wide lint/build/test currently fail only on other workers' in-progress files (src/adapters/download/fetch.ts: no-control-regex 122:50, TS1294 70:5), not on this change. Prettier clean on my 2 files. Full `pnpm test` and `run.mjs checks` not green because of that; coordinator to re-run once that card lands. CI gate platform: ubuntu.
- Limit: booleans nested in a list or object still go through JSON.stringify (`true`); the audit asks only for the top-level `valueText` fix.

Release lines:
CHANGELOG: Fixed: Cura export writes boolean setting values as `True` and `False`, which Uranium can read.
(no export lines)

**Review passed (sp12-rev-prf-130)**
Ran in profiles-cura: `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 193 passed / 11 files (export.test.ts 10), `node scripts/run.mjs checks` exit 0.
Fix matches audit finding 3 exactly (`valueText` in `export/cura/write.ts:42`). Probe: removing the boolean branch (back to `String(v)`) fails 'booleans are written as Python literals' (1 failed / 10). Expected `True`/`False` are literals from Uranium's `ast.literal_eval` rule, not from the code. Bounds: no new input path; existing maxChars/maxEntities tests unchanged.
Follow-up (not blocking, out of the audit's named fix): booleans inside a list or object still go out through `JSON.stringify` as `true`; the audit mentions this case, so a card is worth filing.
