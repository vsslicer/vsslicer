---
id: 444
title: "Refuse null vendorState and duplicate patch keys in mergeStatus, and pin the caps in tests"
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
created: 2026-10-26
---

From PRN-4's passing review (SP10, `vsslicer/modules/printer-api/src/domain/status.ts`; review text in the PRN-4 card).

**Code:** `vsslicer/modules/printer-api/src/domain/status.ts`, `test/status.test.ts` (domain)

## Acceptance criteria

- [ ] `mergeStatus` refuses `null` for `vendorState` and `notifications` (`InvalidStatusError`, `invalidValue`) instead of keeping the base value while dropping its cut; `null` still clears `job` and `position`
- [ ] A patch list with the same key twice is refused (`duplicate`), as `createPrinterStatus` refuses it, so a stale item cut cannot remain (`status.ts:313`)
- [ ] Caps tests assert the literal numbers (vendor state 256, notifications 256, toolheads 16) and add cases for 17 toolheads and `percent: 100.5`; each probe from the review (cap +1) now fails a test

## Progress

Not started.
