---
id: 447
title: Refuse a null list item in a status push with InvalidStatusError
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 11 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Not started.

### 2026-10-26 sp11-prn-446-447

- **Fix** (printer-api, domain, `src/domain/status.ts`): new `item(field, v)` refuses a list item that is not an
  object with `InvalidStatusError(field, 'invalidValue')`. `Builder.list` calls it on every item it reads (heaters,
  toolheads, extruders, materials, notifications in `createPrinterStatus`), and `byKey` on every patch item before it
  reads the key. `byKey` now takes the list's field name, so its errors say `heaters[0]` /
  `toolheads[0].extruders[1]`; its non-array error now names the list (`heaters`) instead of the key (`id`).
- **Test** `test/status.test.ts` "a null or non-object list item is refused with InvalidStatusError, in create and
  merge (PRN-447)": `null`, `7` and `'x'` as an item of every list, through both `createPrinterStatus` and
  `mergeStatus`, give `InvalidStatusError` with the item's field and `invalidValue`.
- **Bounds:** the check is O(1) per item and runs only on the items the existing caps already read (`max`, `max + 1`
  in merge); no new input is read.
- **Mutation probes:** (1) `Builder.list` without `item()` -> PRN-447 test fails (TypeError from `createPrinterStatus`);
  (2) `byKey` without `item()` -> PRN-447 test fails (TypeError from `mergeStatus`); both restored.
- **Verify (2026-10-26, macOS; CI gate runs ubuntu/macos/windows matrix):** printer-api `pnpm install`, `pnpm lint`,
  `pnpm build`, `pnpm test` all pass (5 files, 43 tests); `node scripts/run.mjs checks` passes (84/84 runner tests,
  check-licence, check-fixtures). PRN-446 and PRN-447 share `src/domain/status.ts` and `test/status.test.ts`.

**Review passed (sp11-rev-prn-446-447)**

- Ran (printer-api): `pnpm install` ok, `pnpm lint` ok (eslint, prettier, tsc test config), `pnpm build` ok,
  `pnpm test` 5 files / 43 tests pass; `node scripts/run.mjs checks` passes (runner tests, check-licence,
  check-fixtures). Diff is `src/domain/status.ts` and `test/status.test.ts` only, domain layer, no new imports.
- Matches audit finding 11's fix: `item()` refuses non-objects with `InvalidStatusError(field, 'invalidValue')` in
  `Builder.list` and in `byKey` before the key is read; error fields name the item (`heaters[0]`,
  `toolheads[0].extruders[1]`). The non-array error now names the list (`heaters`), an improvement.
- Mutation probes (each restored): `Builder.list` without `item()` -> PRN-447 test fails; `byKey` without
  `item()` -> fails; `item()` refusing only `null` (letting 7/'x' through) -> fails.
- Hostile probe: a 10^7-element proxied patch of `null`s throws `heaters[0]: invalidValue` after 1 index read.
  An array item (`[[]]`) passes `item()` and is refused as `id: missing`, fine.

Release lines:
- CHANGELOG (printer-api, Fixed): a `null` or non-object list item in `createPrinterStatus` or `mergeStatus` is
  refused with `InvalidStatusError` (`invalidValue`) instead of a `TypeError` (PRN-447).
- Exports: none.
