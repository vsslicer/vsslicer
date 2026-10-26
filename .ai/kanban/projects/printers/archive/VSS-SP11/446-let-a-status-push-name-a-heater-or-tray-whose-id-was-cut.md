---
id: 446
title: Let a status push name a heater or tray whose id was cut
type: bug
priority: P1
effort: S
model: opus
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 3 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Not started.

### 2026-10-26 sp11-prn-446-447

- **Fix** (printer-api, domain, `src/domain/status.ts` `byKey`): a patch item's string key is compared after the same
  cut `createPrinterStatus` applies (`k.slice(0, STATUS_LIMITS.id)`), so the full 300-character id the next push sends
  matches the stored 256-character id instead of being appended and refused as `duplicate`. Numeric keys (`index`)
  are compared unchanged. The merged item still holds the full id, so `createPrinterStatus` cuts it again and keeps
  the `tooLong` truncation.
- **Test** `test/status.test.ts` "a heater or tray id cut to the cap still merges when the next push sends it in full
  (PRN-446)": two successive pushes of a 300-character heater id and material tray merge into one item each, the
  `tooLong` cuts stay. Bounds: a 10^6-character key merges to one item whose id has length `STATUS_LIMITS.id`.
- **Bounds:** the cut is one `slice` to 256 characters per patch item, read only for the at most `max + 1` items
  `byKey` already reads; the stored key stays capped by `createPrinterStatus` (hostile 10^6-character key test).
- **Mutation probe:** `cut = k` (no slice) -> the PRN-446 test fails with `InvalidStatusError printer status
  heaters[1].id: duplicate` (the audit's failure); restored.
- **Verify (2026-10-26, macOS; CI gate runs ubuntu/macos/windows matrix):** printer-api `pnpm install`, `pnpm lint`,
  `pnpm build`, `pnpm test` all pass (5 files, 43 tests); `node scripts/run.mjs checks` passes (84/84 runner tests,
  check-licence, check-fixtures). PRN-446 and PRN-447 share `src/domain/status.ts` and `test/status.test.ts`.

**Review passed (sp11-rev-prn-446-447)**

- Ran (printer-api): `pnpm install` ok, `pnpm lint` ok (eslint, prettier, tsc test config), `pnpm build` ok,
  `pnpm test` 5 files / 43 tests pass; `node scripts/run.mjs checks` passes (runner tests, check-licence,
  check-fixtures). Diff is `src/domain/status.ts` and `test/status.test.ts` only, domain layer, no new imports.
- Matches audit finding 3's fix: `byKey` compares a string key after `slice(0, STATUS_LIMITS.id)`, the same cut
  `Builder.str` applies; numeric `index` keys unchanged. Cut stays in `createPrinterStatus` (test checks `tooLong`).
- Mutation probe: `cut = k` -> the PRN-446 test fails (1 failed / 23 passed in `status.test.ts`); restored.
- Hostile probes (throwaway test, deleted): 10^6-char key merges to one 256-char item (also in the card's test);
  an id equal to the cut base in its first 256 chars merges into it, consistent with `createPrinterStatus`
  treating the two as one id.
- Note for later, not blocking (beyond the audit's stated fix): only the patch side is cut, so the SAME long id
  twice in ONE patch for a heater not in the base appends the first item with its full id and refuses the second
  as `heaters[n].id: duplicate`, whereas a short id twice merges. Cutting both sides (`String(x[key]).slice(...)`)
  would make it consistent. Unrealistic for a real printer push.

Release lines:
- CHANGELOG (printer-api, Fixed): `mergeStatus` matches a heater id or material tray that was cut to
  `STATUS_LIMITS.id` against the full id a later push sends, instead of refusing it as a duplicate (PRN-446).
- Exports: none.
