---
id: 279
title: Report archive name collisions as ArchiveError with the right format label
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 7 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done. `Output.file` maps EEXIST to `ArchiveError("<name>: collides with another entry")`; `Reader` labels only gunzip/file-read errors "gzip:" and the blanket re-wrap in `readTarGz` is gone. Test (NFC vs NFD name, zip and tar.gz; skipped on volumes that do not alias, runs on APFS) asserts ArchiveError, message, no "gzip". `mkdirs` already raised ArchiveError for non-directory collisions. Bounds: none new; existing limits unchanged.
Mutation probes: EEXIST mapping removed -> collision test fails; "gzip:" label put on the collision -> fails.
Verified: pnpm lint, build, test in slicer-runtime (75 tests, 4 files) and `node scripts/run.mjs checks` all pass.

**Review failed (sp10-rev-slc-279-280)**
Ran in slicer-runtime: pnpm install, lint, build clean; pnpm test 75/75 (4 files), the NFC/NFD test ran here (APFS is normalisation-insensitive, not skipped). `node scripts/run.mjs checks` exits 1, but only on `modules/mesh/test/zz-probe-397.test.ts` (another reviewer's probe, no SPDX header), not on this module.
Mutation probes (copy): EEXIST mapping removed -> 1 fails; Reader "gzip:" label removed -> 1 fails.
Hostile probe on a case-insensitive APFS image (`TMPDIR=/Volumes/...`): zip `A`+`a`, tar.gz `A`+`a`, tar.gz `D/x`+`d` all give `ArchiveError: …: collides with another entry`. The code is right; the default tmp on this machine is case-sensitive, so the same probe extracts both names there.
1. No case-alias test (`test/extract-archive.test.ts:L319-L341`). The only collision test is gated on NFC/NFD aliasing, which NTFS does not do, so on the windows-latest CI leg (`.github/workflows`, matrix ubuntu/macos/windows) it skips and nothing covers the EEXIST mapping, though NTFS is case-insensitive and does alias `A`/`a`. Linux skips both, as expected. Fix: add a second probe-gated test (write `A`, check `a` resolves, `describe.skipIf`) with zip and tar.gz `A`+`a` asserting ArchiveError /collides/ and no "gzip"; rule: each aliasing kind the fix claims (the comment at `src/adapters/extract-archive.ts:L224` names case) gets a test that runs where that kind exists. Also fix the garbled probe comment "NTFS-less case folding differs" (L319).

**Review fix (sp10-slc-fix)**
Added a case-alias test (`A`+`a`, zip and tar.gz, asserts ArchiveError /collides/ and no "gzip"), gated by a probe that writes `A` and checks `a` resolves (`describe.skipIf`), so it runs on NTFS and default APFS and skips on ext4. Fixed the garbled probe comment. It skipped here (case-sensitive tmp); the same assertions were confirmed by the reviewer on a case-insensitive image. No mutation probe could run locally for it: the EEXIST mapping is already covered by the NFC/NFD test, which exercises the same code path.
Verified: pnpm lint, build, test in slicer-runtime (77 passed, 1 skipped, 4 files), `node scripts/run.mjs checks` exit 0.

**Review passed (sp10-rerev-slc)**
Ran in slicer-runtime: pnpm install, lint, build clean; pnpm test 77 passed, 1 skipped (the case-alias test, default tmp here is case-sensitive); `node scripts/run.mjs checks` exit 0.
Earlier fail 1 fixed: case-alias test at `test/extract-archive.test.ts` (probe-gated `describe.skipIf(!caseFolds)`, zip and tar.gz `A`+`a`, ArchiveError /collides/, no "gzip"); garbled comment fixed.
Ran it for real on a case-insensitive APFS disk image (hdiutil, `TMPDIR` pointed at it): 47/47 in the file, 0 skipped, the case-alias test passes. Mutation probes there (copy of the module): EEXIST mapping removed -> fails; collision labelled "gzip:" -> fails; collision thrown as plain Error -> fails; restored -> passes. Image detached and deleted.
