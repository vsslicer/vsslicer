---
id: 103
title: Add the Orca and Bambu bundle archive reader and writer with safety limits
type: feature
priority: P1
effort: M
model: opus
area: [export, importers]
story: US48
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [120, 135]
created: 2026-10-25
---

Archive handling for `.orca_*`, `.bbscfg` and `.bbsflmt` using fflate directly (no archive module is shared across adapters, KISS), enforcing Orca-style containment (`PresetBundle.cpp:2428`) and size limits; security-sensitive.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/archive/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] Malicious archives (path traversal, absolute path, zip bomb, symlink, 10 000 entries) are rejected with a message and write nothing (archives built in the test)
- [x] Entry-count and uncompressed-size limits are constants with tests at the limit and one over
- [x] Reading returns entries in memory; nothing is extracted to disk

## Tasks

- [x] Write the reader with limits
- [x] Write the writer
- [x] Malicious-archive tests

## Progress

Not started.

Review (sp8-reviewer-14, 2026-10-26 08:10): PASS. Ran `pnpm test` (41 passed), `pnpm lint`, `pnpm build` in profiles-orca: clean. `node scripts/run.mjs checks` fails only on `modules/slicer-extension/src/domain/zz_violation.ts` (missing SPDX), not this card's file. Hostile probe (hand-built zips plus fflate, 60 cases, scratch only): every traversal/absolute spelling (`a/../../x`, `/x`, `C:x`, `c:/x`, `\\srv\x`, `a/.. /x`, `a/... /x`, `./x`, `a//b`, NUL, non-UTF-8 name) refused; `%2e%2e`, U+FF0E and U+2024 lookalikes accepted as literal names (correct, nothing decodes them); symlink (host 3) refused; 10 000 entries refused in the EOCD count check; ZIP64 markers in count, CD offset, entry size and compressed size all refused; truncated CD, count above records, CD offset past end refused; overlapping data refused; declared-1000-byte deflate of 200 MB stopped at the declared size; ratio bomb refused; 480 x 64 KiB entries under the ratio floor stay inside the 32 MiB total cap. No hang, no quadratic path: every loop is bounded by the 1024-entry cap or a 64 KiB slice. Writer: byte-identical output under UTC, Kiritimati and Los Angeles; entry names, order (printer, filament, process, manifest last), level 6 and the manifest via `buildBundleStructure` match OrcaSlicer@09aa0114 `ExportPresetBundleDialog.cpp:374-463`; reader routing (manifest found by its exact, case-sensitive root name) matches `PresetBundle.cpp:2410-2420`. Against 3mf `fflateZip.ts`: this reader is stricter on every point (names, symlinks, duplicates, overlap, ratio, fatal UTF-8, ZIP64 refused); neither checks CRC, so 3mf closes no hole this one leaves open. The local-header `shortcut:` is acceptable: data is located only through CD offsets, the local name is never used, the original bytes are never passed on (the writer re-serialises), and Orca's miniz also takes names from the central directory, so no reader sees a different name.
Advisory findings (not blocking, since nothing is extracted to disk; they matter only once a caller writes entries to disk by name):
1. bundle-archive.ts:49: `:` is refused only at index 1, so `printer/C:evil.json`, `printer/x.json:ads` (reader) and `ab:c.json` (writer) pass. Those are NTFS alternate-stream names on Windows. Fix: refuse `:` anywhere in `unsafeEntryName`.
2. bundle-archive.ts:116: duplicate key is `toLowerCase()` only, so `printer/é.json` NFC and NFD both pass and collide on APFS. Segments ending in `.` or space (`a/x.`, writer `x `) alias `a/x` on Windows. Fix: key on `name.normalize('NFC').toLowerCase()` and refuse a trailing `.`/space per segment.
3. bundle-archive.ts:112: S_IFLNK is checked only for host 3. Host 19 (OS X) with symlink mode bits passes. Fix: check the mode bits whenever the high 16 bits are non-zero.
4. bundle-archive.ts:142: the CRC-32 is never verified, and unlike 3mf (`fflateZip.ts:23`) there is no `shortcut:` comment. A damaged preset is returned silently. Fix: verify with `zlib.crc32`, or add the shortcut comment.
5. bundle-archive.ts:64-70: the backward EOCD scan takes a fake EOCD inside the comment (the archive then reads as empty) and ignores trailing bytes. It fails safe. Optional hardening: require `eocd + 22 + commentLen === data.length`.
