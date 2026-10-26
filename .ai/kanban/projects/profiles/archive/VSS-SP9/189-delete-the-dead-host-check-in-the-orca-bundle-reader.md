---
id: 189
title: Delete the dead host check in the Orca bundle reader
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 10 of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] `host` and `host >= 0 &&` are deleted from `profiles-orca/src/adapters/archive/bundle-archive.ts:L109,L132`, and `data[p + 5]` is no longer read without `need()`
- [x] Behaviour is unchanged: the existing archive tests pass unmodified

## Progress

Deleted `const host = data[p + 5]!` and the `host >= 0 &&` guard (always true) in `bundle-archive.ts`; the symlink check now reads only `attrs`. No unchecked read of `data[p + 5]` remains. Verified: profiles-orca `pnpm test` 50/50 passed with no test edits, lint and build clean, `run.mjs checks` clean. Not done: no new test (pure deletion, behaviour unchanged).

**Review passed (sp9-rev-prf-189)** Diff is the two deletions the audit asked for (`host` and `host >= 0 &&` in `src/adapters/archive/bundle-archive.ts`); no test files changed. Ran in profiles-orca: `pnpm test` 50/50 passed, `pnpm lint` clean, `pnpm build` clean; `node scripts/run.mjs checks` exit 0. Out-of-bounds check near the changed lines: every central-directory read (`u16`/`u32`) goes through `need()`, the name `subarray` is guarded by `need(p + 46, nameLen)`, the entry data by `need(start, compressedSize)`, and the EOCD scan stays within `[0, length - 22]`; no raw `data[...]` index remains in the file. Probe (temp dir, deleted): 1370 hostile inputs from a real zip (every byte flipped and zeroed, every truncation, cdOffset pointed into the EOCD tail) all failed with the reader's own error; zero RangeError/TypeError. No new test needed: pure deletion of an always-true condition. In-place non-behaviour fix: restored the missing `;` in the comment at `bundle-archive.ts:L130` ("high 16 bits; S_IFLNK"); lint re-run clean.
