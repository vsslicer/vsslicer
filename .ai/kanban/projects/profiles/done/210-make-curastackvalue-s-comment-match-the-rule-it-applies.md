---
id: 210
title: "Make curaStackValue's comment match the rule it applies"
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 10 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done (agent sp11-prf-209-210). The audit offers a comment fix or dropping the export; chose the comment: `curaStackValue`'s doc in `src/domain/stack.ts` now says it walks every stack given, and the caller passes the global stack alone for a key that is not `settable_per_extruder`. Comment-only, so no test can fail without it (nothing behavioural changed); the existing `definitions.test.ts` cases still pass.
Bounds: no input handling changed.
Verify (profiles-cura): lint, build pass; test 120/120; `node scripts/run.mjs checks` passes. CI gate platform: Linux (ubuntu).
Release lines: none (comment only).

**Review passed (sp11-rev-prf-209-210)**
Ran in profiles-cura (macOS): `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 120/120; `node scripts/run.mjs checks` exit 0.
Audit finding 10 allows either fix; the comment one is taken. `src/domain/stack.ts:25-29` now says the function walks every stack given and the caller passes the global stack alone for non-`settable_per_extruder` keys, which matches the loop. Checked the cited upstream `.reference/repos/Cura/cura/Settings/ExtruderStack.py:135-136` (`if not super().getProperty(key, "settable_per_extruder", ...)`: `getNextStack().getProperty(...)`): matches. No in-module callers besides the `domain/index.ts` export. Comment-only, so no mutation probe applies; no input handling changed.
