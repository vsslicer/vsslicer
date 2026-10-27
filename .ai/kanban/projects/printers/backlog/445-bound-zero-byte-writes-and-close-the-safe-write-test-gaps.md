---
id: 445
title: Bound zero-byte writes and close the safe-write test gaps
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP18"
created: 2026-10-26
---

From PRN-132's passing review (SP10): mutation survivors in `vsslicer/modules/printer/folder/src/adapters/safe-write.ts`.

**Code:** `src/adapters/safe-write.ts`, `test/safe-write.test.ts` (adapters)

## Acceptance criteria

- [ ] A write that accepts 0 bytes is refused after a bounded number of attempts (no endless loop), with a test through injected ops that fails with the check removed
- [ ] Tests that fail when: EACCES is dropped from the directory-fsync ignore list; `nodeFileOps.syncDir` skips the sync; the abort check before the rename is removed (an aborted write is never renamed into place); errors without a code are mapped
- [ ] A final name that matches the temp-name pattern (`XXXXXXXX.TMP`) cannot clash with a concurrent writer's temp file (refuse or rename), with a test

## Progress

Not started.
