---
id: 180
title: Encode bundle manifest only near the byte limit
type: bug
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP8"
docs: [.ai/audits/SP7-audit.md]
created: 2026-10-26
---

SP7 audit finding 1 (`.ai/audits/SP7-audit.md`). Package profile-api, layer domain (`src/domain/bundle/bundle.ts:L106-L107`).

`parseBundleStructure` UTF-8 encodes every manifest under the limit, though the comment says the byte count is checked only near the limit.

## Criteria
- Encode only when `text.length * 3 > BUNDLE_LIMITS.maxBytes`, as the audit describes.
- A test that fails before the fix is not possible for a pure efficiency change; add tests that a manifest of 1/3 the limit in 3-byte characters passes and one just over the limit in bytes fails (`too-large`).
- Rule 25 bound unchanged: `BUNDLE_LIMITS.maxBytes`.

## Progress

Review (sp8-reviewer-1, 2026-10-26 07:43): FAIL
1. `vsslicer/modules/profile-api/src/domain/bundle/bundle.ts:107`: the fix replaced `text.length > max ||` instead of adding to it, so the cheap reject for oversize input is gone. The 3x bound itself is exact (BMP char: 1 unit, at most 3 bytes; surrogate pair: 2 units, 4 bytes; lone surrogate: 1 unit, 3 bytes as U+FFFD), but every input longer than `maxBytes` UTF-16 units is now encoded in full before being refused. Probe: a 300M-unit string allocates a 300 MB copy (about 94 ms) before `too-large`; before the change it was refused with no copy. That is an unbounded copy on hostile input (rule 25). Fix wanted: `if (text.length > max || (text.length * 3 > max && new TextEncoder().encode(text).length > max))`, plus a test that a string longer than `maxBytes` units is `too-large` (it may already exist; keep it).
2. Test `test/bundle.test.ts:111` is right and passes (fit and fit+1 euro signs bracket the limit, and `over.length < max` proves the byte path is taken). Keep it.
Ran: profile-api `pnpm test`, `pnpm lint`, `pnpm build` (pass); scratch probe (300M ascii, emoji and lone-surrogate strings around the limit: codes correct).

Review (sp8-reviewer-7, 2026-10-26 07:53): PASS
Fix round 1 resolves finding 1: `bundle.ts:109` is `text.length > max || (text.length * 3 > max && encode(text).length > max)`, so the cheap no-copy reject is back, encoding happens only near the limit, and the byte bound is exact. New test `bundle.test.ts:124` spies on `TextEncoder.prototype.encode` and checks that a `maxBytes+1`-unit string is refused without encoding; the 3-byte boundary test at :111 is still there. Rule 25 bound unchanged (`BUNDLE_LIMITS.maxBytes`).
Scratch probe: a 300M-unit string gives `too-large` in 0.4 ms with 0 encode calls; `{}` and length max/3 make 0 encode calls, length max/3+1 makes 1; boundaries hold exactly for ASCII (max / max+1), 3-byte euro (max/3 / +1), 4-byte emoji pairs (max/4 / +1) and lone surrogates (max/3 / +1): pass, then `too-large`.
Ran: profile-api `pnpm test` (709 pass), `pnpm lint`, `pnpm build`; `node scripts/run.mjs checks` (exit 0).
