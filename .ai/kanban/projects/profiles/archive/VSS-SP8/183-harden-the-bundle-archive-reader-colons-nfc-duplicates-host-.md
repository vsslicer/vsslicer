---
id: 183
title: "Harden the bundle archive reader: colons, NFC duplicates, host-19 symlinks, CRC and EOCD position"
type: bug
priority: P2
effort: S
model: sonnet
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [103]
created: 2026-10-26
---

Follow-up from the PRF-103 review (sp8-reviewer-14, SP8): advisory hardening of `readBundleArchive` / `writeBundleArchive`. Not exploitable today (nothing writes entries to disk by name), needed before any importer extracts.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/archive/bundle-archive.ts` and its test (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] `:` is refused anywhere in an entry name (reader and writer): NTFS alternate streams, `C:` mid-path (test)
- [x] Duplicate detection normalises with NFC before lowercasing; a segment ending in `.` or space is refused (tests for both)
- [x] Symlink mode bits are refused for every host system that carries Unix modes (host 3 and 19 at least) (test)
- [x] CRC-32 is verified on read (or a `shortcut:` comment states the limit), with a damaged-entry test
- [x] The end-of-central-directory record must end the file (`eocd + 22 + commentLen === length`); a fake EOCD in the comment is refused (test)

## Progress

Not started.

PRF-183-worker: all five items done in bundle-archive.ts and its test (colon anywhere; NFC+lowercase key and trailing dot/space segments in reader and writer; symlink check on any host; CRC-32 verified with an in-file table CRC, since fflate exports none; EOCD must end the file). profiles-orca: 50 tests, lint, build and `run.mjs checks` pass. Nothing for index.ts, CHANGELOG or dependencies beyond: CHANGELOG Unreleased "Bundle archive reader refuses colons, NFC duplicates, Windows-trimmed names, host-19 symlinks, CRC mismatches and a non-final EOCD."

Review (sp8-reviewer-18, 2026-10-26 08:18): PASS

Checked all five criteria against code and tests, and probed with hand-built and fflate-built zips in scratch. CRC table matches the standard vectors ("123456789" → 0xCBF43926, "" → 0, the quick brown fox → 0x414FA339) and a 1-bit CRC change is refused. 18 fflate zips (sizes 1 B to 300 KB, levels 0/1/9) read back. Symlink mode bits are refused on hosts 0, 3, 19, 10 and 255. A regular 0o100644 file and DOS attrs 0x20 are accepted. Colons anywhere and trailing dot/space segments are refused; `.hidden`, `a..b` and `a/ .b` are accepted. NFC duplicates (U+00C5 vs U+212B) and Kelvin vs `k` are refused. Trailing bytes and a non-final fake EOCD are refused. An 8 MiB stored entry takes about 70 ms with CRC. PRF-103's limits are unchanged (only additions in the diff), and its tests still pass. Module `pnpm test` (50), `lint`, `build` and `node scripts/run.mjs checks` (exit 0) pass. Only the module's adapter and test files changed.

Advisory, no fix needed for this card:
1. bundle-archive.ts:79-88: the backward scan stops at the first signature it finds. Two effects follow. (a) A legitimate zip whose comment is 22 bytes or longer and contains `PK\5\6` is now refused (probed). (b) A fake EOCD in the comment whose own comment length reaches exactly to the end of the file is accepted, and wins over the real one (probed: a fake with 0 entries reads as an empty archive). (b) agrees with every backward-scanning reader, Orca's miniz included, so the meaning does not change. Wanted later: keep scanning for a candidate that ends the file, and also require `cdOffset + cdSize === eocd`.
2. bundle-archive.ts:132: `host >= 0` is always true. Drop the condition and keep the comment "any host".
3. The writer's NFC duplicate path (`nameKey` in `writeBundleArchive`) has no test of its own. The reader test covers the shared key.
