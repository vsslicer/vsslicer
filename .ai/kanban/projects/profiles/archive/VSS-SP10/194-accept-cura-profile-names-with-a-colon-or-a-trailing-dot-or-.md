---
id: 194
title: Accept Cura profile names with a colon or a trailing dot or space in .curaprofile archives
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 1 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Dropped the drive-letter, colon and trailing-dot/space rules from `unsafeEntryName` (curaprofile-archive.ts); empty, NUL, backslash, absolute and `.`/`..`/blank segments still refused, and the entry/size/name limits are untouched (no new input handling, so no new bound). Tests: new round-trip of `ultimaker_s5_draft:_pla.`, `um3:custom`, `abc `, `v1.`, `C:x`; removed the two hostile cases (`ab:stream`, `evil.`, `C:/evil`) that asserted the old rules; the writer-refusal test now uses a backslash id. CHANGELOG line added.
Mutation probe: re-adding the colon rule makes 3 tests fail; restored.
Verify: pnpm lint, build clean; pnpm test 50/50; `node scripts/run.mjs checks` passed.

**Review passed (sp10-rev-prf-89-194)**

Ran in `profiles-cura`: `pnpm install` ok, `pnpm lint` clean, `pnpm build` clean, `pnpm test` 50 passed (4 files; archive test file 25), `node scripts/run.mjs checks` exit 0. No PRF-30 files were dirty in the module.

Against SP9-audit finding 1: `unsafeEntryName` keeps exactly the audit's list (empty, NUL, backslash, absolute, `.`/`..`/blank segments) and the test round-trips `ultimaker_s5_draft:_pla.`. Entry/size/name limits untouched; existing hostile tests (`..`, absolute, backslash, symlink, encrypted, limits) still pass.

Mutations in a mktemp copy: re-adding the colon rule (3 failed), the trailing dot/space rule (3 failed), the drive-letter rule (1 failed), removing the backslash rule (2 failed).

Drive-letter rule: the audit's keep-list does not include it, and dropping it is safe today. Entry names only become `CuraProfileEntry.id` in memory: the only callers of `readCuraProfileArchive`/`writeCuraProfileArchive`/`unsafeEntryName` in `vsslicer/modules` are this file and `src/index.ts` (re-export); nothing joins an id to a path. Residual risk, noted only: `unsafeEntryName` is exported, and an id such as `C:x` passed to `path.win32.resolve(dir, id)` would leave `dir`; its doc comment now says callers that write ids to disk sanitise there, which is the right contract for any future file-system consumer.
