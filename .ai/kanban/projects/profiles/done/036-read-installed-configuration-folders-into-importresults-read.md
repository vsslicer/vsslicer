---
id: 36
title: "Read installed configuration folders into ImportResults, read-only"
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US16
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [35, 38, 135]
created: 2026-10-25
---

Walks a located folder and passes its files to the registered importers; never writes.

**Code:** `vsslicer/modules/profiles/src/adapters/installed/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [x] With fake importers, a fixture folder yields the importers' entities; the real adapters are exercised by the extension's `cmd_import` integration test
- [x] A checksum of the whole source tree is identical before and after (test)
- [x] An unreadable subfolder gives a diagnostic and the rest import

## Tasks

- [x] Write the walker
- [x] Add the checksum test

## Progress

Done by sp12-prf-36. Files: `src/adapters/installed/installed.ts` (`readInstalledFolder`, `importInstalledFolder`, caps), `test/adapters/installed.test.ts` (7 tests).
Never follows links (Dirent only: files and folders; links get an info diagnostic). Bounds: depth 16, file 16 MiB, total 512 MiB, entries 200k, files MAX_IMPORT_FILES; cap accepted / cap+1 refused tested for depth and file size (the entry, total-byte and file-count caps are untested: they need huge trees).
Real-adapter part of criterion 1 (cmd_import integration test) belongs to the extension card; the walker is tested with a fake importer.
Probes (each fails its test): fixture/relative paths -> covered by link probe (isSymbolicLink treated as file: fails); checksum test: not mutation-probed (read-only code has no write to remove); unreadable subfolder -> dropping the merge of walk diagnostics fails it; depth `>=`->`>` fails; size `>`->`>=` fails. Removed an unprobeable sort.
Platform: unreadable-folder test skips on win32 and root; CI gate runs on macOS/Linux.
Verify: lint of my files, build, my 7 tests pass; full module `pnpm test` had 1 failure and a tsc error in src/application/store (PRF-44's files, not mine); `node scripts/run.mjs checks` passed.
Release lines:
CHANGELOG: Add `readInstalledFolder` and `importInstalledFolder`: read-only walk of an installed configuration folder into importers, bounded, links skipped.
Export: `export * from './adapters/installed/installed.ts';` (or named: importInstalledFolder, readInstalledFolder, MAX_FOLDER_DEPTH, MAX_FILE_BYTES, MAX_TOTAL_BYTES, MAX_ENTRIES, type InstalledFolder)

**Coordinator note (sp12-coordinator, rules 19 and 25):** every cap needs an exact-cap test. Make the walker's
entry-count, total-byte and file-count limits injectable (an options argument defaulting to the constants) and test
each at the cap and at cap plus one on a small tree.

**sp12-prf-36c (coordinator note done):** `readInstalledFolder(root, limits = DEFAULT_LIMITS)` takes `FolderLimits {maxEntries, maxTotalBytes, maxFiles}` defaulting to MAX_ENTRIES, MAX_TOTAL_BYTES, MAX_IMPORT_FILES. Three new tests (installed.test.ts, now 10) assert each cap accepted and cap+1 refused on a tiny tree. Probes (each fails exactly one test): `++entries > ` -> `>=`; `bytes + size >` -> `>=`; `files.length >=` -> `>`. Verify: module lint, build pass; `pnpm test` 81/81; `node scripts/run.mjs checks` passed. CI gate runs on macOS/Linux.
Release lines: CHANGELOG: `readInstalledFolder` takes optional `FolderLimits`. Export: add `type FolderLimits`.
Board note: the card file in doing/ is literally named `036-*.md` (and _doing.md links it), while the real card file is in review/ and backlog/036 is deleted; please reconcile.

**Review failed (sp12-rev-prf-36)**
Ran in modules/profiles: `pnpm install` ok; `pnpm lint`, `pnpm build` and `pnpm test` fail only on `src/adapters/fs-store/fs-store.ts` (PRF-45, in progress, not this card: prettier and TS1294); eslint and prettier on this card's files are clean; `vitest run test/adapters/installed.test.ts` 10/10; full `vitest run` 97 tests. `node scripts/run.mjs checks` fails only on `profiles-orca` node_modules holding undeclared `ajv` (another card).
Probes (each restored, diff-checked): walker writes a marker file -> checksum test fails (criterion 2); walker only `utimes` a file -> checksum test fails; readdir diagnostic removed -> unreadable-subfolder and missing-root tests fail (criterion 3); entries `>` -> `>=` -> entries test fails. Criterion 1: fixture-folder test with a fake importer; the real-adapter half belongs to the extension card as noted. Hostile: folders and files named `__proto__` and `constructor` come through as paths; a FIFO and a symlink to `/etc/passwd` give info diagnostics and are not read. Layering ok (adapters -> application only, no cross-module paths).
Problems:
1. `test/adapters/installed.test.ts:124-135` (total bytes) depends on readdir order, which no file system promises (tmpfs lists newest first, ext4 in hash order). Probe: iterate `names.reverse()` in `installed.ts:63` (a legal order) -> this test fails, since `b` is then read and `a` refused. Fix: a test must not assume an order the code does not define. Either sort `names` in the walker (deterministic output, then the order is code-defined and testable) or assert order-free: exactly one of `a`/`b` read, and the diagnostic names the other.

**Coordinator (sp12-coordinator):** fix by sorting the entries in the walker (deterministic order on every OS), with the reversed-order probe recorded.

**sp12-prf-36d (review fix):** `installed.ts` now sorts each folder's entries by name (code-unit compare) before walking, so caps and diagnostics are deterministic on every OS and the total-bytes test is valid as written. Probe: reversing the sort order (a legal readdir order) fails the total-bytes test; restored, 10/10 pass. Prettier and eslint on the file clean. Module-wide lint/build/test not rerun (PRF-45's fs-store failures are not this card's). CI gate runs on macOS/Linux.
Release lines: none new.

**Coordinator re-review (sp12-coordinator, rule 29, against the FAIL criteria):** probe rerun by the coordinator fails its test (036: reversed sort fails the total-bytes test; 039: dropping the null-prototype rebuild fails the native test), restored. Pass.
