---
id: 212
title: "Decode quote_plus'd Cura machine instance file names"
type: bug
priority: P0
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 2 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done in profiles-cura (adapters/instances). `unquotePlus` exported from definitions/read.ts; `stemOf` in instances/read.ts decodes the stem, so machine, extruder and definition_changes names all decode.
- Test: instances.test.ts, 'a quote_plus file name (space, %2B, unicode)' and 'a malformed escape ... stays as written'.
- Probe (criterion 1): stemOf without unquotePlus -> both new tests fail; restored.
- Probe (criterion 2, bounds): the fix adds no loop or limit; unquotePlus is a linear replaceAll plus decodeURIComponent, with a malformed escape caught. File-count and byte caps are checked before parsing and unchanged (existing tests); decoding only shortens the stem. The malformed-escape test is the hostile case.
- Verify: pnpm lint ok, pnpm test 161 passed. pnpm build FAILS on src/adapters/download/fetch.ts(70,5) TS1294 erasableSyntaxOnly, a file from another concurrent card (not mine). `run.mjs checks` reported no failures (CI gate platform: Linux).
Release lines: CHANGELOG: Fixed: Cura machine instance file names are decoded as quote_plus, so a machine id with a space finds its nozzle size.

**Review passed (sp12-rev-prf-130)**
Ran in profiles-cura: `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok (the earlier fetch.ts build failure is gone), `pnpm test` 193 passed / 11 files, `node scripts/run.mjs checks` exit 0.
Fix matches audit finding 2: `unquotePlus` exported from `definitions/read.ts`, used in `stemOf` (`instances/read.ts:48`), so machine, extruder and definition_changes stems decode. Ids land in `Map`s and a null-prototype `native`, so a decoded `__proto__`/`constructor` stem is a plain key.
Probes: `stemOf` without `unquotePlus` -> both new tests fail (2 failed / 13). Expected ids are hand-written literals checked against Python: `unquote_plus('m%ZZ+x') == 'm%ZZ x'` (python3 -I). Bounds: no new loop or cap; file and byte caps still apply before parsing.
Note (not blocking, pre-existing): on a string mixing a valid and a malformed escape the JS fallback leaves all escapes undecoded (`a%41%ZZ+b` -> `a%41%ZZ b`, Python gives `aA%ZZ b`). Uranium only writes `quote_plus` output, so only hand-made names hit it.
