---
id: 281
title: Report a symlink name collision as ArchiveError in extractArchive
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 12 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done. `Output.finish()` in `slicer-runtime/src/adapters/extract-archive.ts` now maps `EEXIST` from `symlink()` to `ArchiveError("<path>: collides with another entry")`, as `file()` does. No new input is touched, so the existing limits and staging cleanup are unchanged.
Tests (`test/extract-archive.test.ts`, aliased-names block, runs where NFC/NFD alias, e.g. macOS APFS; skipped elsewhere): NFC file + NFD symlink, and two symlinks, both tar.gz, expect ArchiveError /collides/.
Mutation probe: changing the guard code to a non-matching value made both new tests fail; restored.
Verify: lint, build clean; module tests 80 passed, 1 skipped; `node scripts/run.mjs checks` exit 0. Platform: macOS (local); the CI gate platform must alias NFC/NFD for these tests to run.

Release lines:
- CHANGELOG: Fixed: a name collision with a symlink entry is now an `ArchiveError`, not a raw `EEXIST` (SLC-281).
- Exports: none.

**Review passed (sp11-rev-slc-281)**
- Ran in slicer-runtime: `pnpm install`, `pnpm lint` clean, `pnpm build` clean, `pnpm test` 8 runs: 80 passed, 1 skipped in 7; 1 run failed only `run-process.test.ts > grandchildren in the group are killed` (ESRCH check at L62 races the grandchild's death). That test is not touched by this card: a pre-existing flake, worth its own card. `node scripts/run.mjs checks` exit 0.
- Criterion 1: `extract-archive.ts:L262-L269` maps `EEXIST` from `symlink()` to `ArchiveError("<name>: collides with another entry")`, same as `file()` at L219; other errors are rethrown. Staging is still removed by the catch at L103-L105 in `extractArchive`.
- Mutation probe: changed the guard at L266 to `'XEEXIST'`; both new tests (file + NFD symlink, two symlinks) failed, the existing collision test still passed. Restored, diff identical to before.
- Criterion 2 (bounds): no new input path; the tests use tar.gz with sha256 through the same `extract` helper, so entry/size/ratio limits are unchanged. Hostile input is the aliased-name pair itself.
- Layering: adapters only, no new imports. Tests run only where NFC/NFD alias (macOS here); CI needs such a platform to exercise them.
- Not done by the worker: the CHANGELOG line (in "Release lines" above) is not in `CHANGELOG.md` yet; left for the coordinator.
