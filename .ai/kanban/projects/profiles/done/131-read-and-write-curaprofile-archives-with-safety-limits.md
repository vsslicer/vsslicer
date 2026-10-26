---
id: 131
title: Read and write .curaprofile archives with safety limits
type: feature
priority: P1
effort: S
model: opus
area: [importers, export]
story: US48
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [121, 135]
created: 2026-10-25
---

Archive handling for Cura profile files using fflate directly; no archive module is shared with other adapters (KISS). Security-sensitive.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/archive/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] Path traversal, absolute paths, zip bomb, symlink and 10 000 entries are rejected with a message and nothing is written (archives built in the test)
- [x] Entry-count and size limits have tests at the limit and one over
- [x] Layout matches upstream: quote the lines of `Cura@5bea2f8:plugins/CuraProfileReader/CuraProfileReader.py:31-58` and `plugins/CuraProfileWriter/CuraProfileWriter.py` that define which entries are read and written (names, encoding, compression) and match them
- [x] **Bounds:** at most 1,000 entries (the 10,000 case is refused), entry names at most 1,024 bytes, each entry at most 16 MiB and the archive at most 64 MiB uncompressed, enforced while inflating (streaming, never trusting the declared size), declared and actual sizes must agree; the writer refuses the same; every limit validated as a positive finite integer when passed in; tests count bytes and entries, never time
- [x] fflate 0.8.3 is already in package.json (coordinator); no other dependency

## Tasks

- [x] Write the guarded reader/writer
- [x] Malicious-archive tests

## Progress

2026-10-26, sp9-prf-131 (Opus):

- Added `vsslicer/modules/profiles-cura/src/adapters/archive/curaprofile-archive.ts`: `readCuraProfileArchive(bytes, limits?)` -> `{ id, text }[]` and `writeCuraProfileArchive(profiles, limits?)`, `resolveLimits`, `unsafeEntryName`, `CURA_ARCHIVE_LIMITS` (1000 entries, 1024 name bytes, 16 MiB/entry, 64 MiB total), `CuraArchiveError`. Same approach as `profiles-orca` `bundle-archive.ts` (central directory fully validated before inflating; streaming `Inflate` in 64 KiB slices that aborts past the declared size; short output, stored-size mismatch and CRC mismatch refused; overlapping entries, ZIP64, encryption, symlinks, duplicate case-folded names, non-UTF-8 names/content refused; ratio > 100:1 refused for deflated entries over 64 KiB). Re-implemented, not imported. Everything is in memory; nothing touches disk.
- Upstream layout, Cura@5bea2f8 (LGPL-3.0, read only):
  - `plugins/CuraProfileReader/CuraProfileReader.py:41-44`: `for profile_id in archive.namelist():` / `with archive.open(profile_id) as f:` / `serialized = f.read()` / `self._upgradeProfile(serialized.decode("utf-8"), profile_id)`: every entry is read, the entry name is the profile id, content is UTF-8.
  - `plugins/CuraProfileWriter/CuraProfileWriter.py:25,29-31`: `zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED)`, `serialized = profile.serialize()`, `profile_file = zipfile.ZipInfo(profile.getId())`, `archive.writestr(profile_file, serialized)`. Because a ZipInfo instance is passed, `writestr` keeps the ZipInfo defaults and ignores the archive's ZIP_DEFLATED: entries are STORED, dated 1980-01-01 (verified with CPython 3.9.6 `zipfile`: compress_type 0, date (1980,1,1,0,0,0)). Our writer matches: one flat STORED entry per profile, named by id, UTF-8 text, fixed 1980 date. The reader accepts STORED and DEFLATED.
  - Not done: the Cura 2.1 fallback at `CuraProfileReader.py:54-58` (a non-zip file read as one bare `.inst.cfg`); the reader refuses non-zip input with "not a zip archive" and a caller can pass such a file straight to the cfg parser. Marked as a `shortcut:` comment.
- Tests: `test/curaprofile-archive.test.ts`, 23 tests (module total 48, all pass). Hostile archives are built in the test by a raw zip writer: `../`, nested `..`, absolute, drive letter, backslash, colon, trailing dot, symlink (S_IFLNK attrs), 10 000 entries, deflate inflating past declared size, 1 MiB zeros (ratio bomb), size disagreements (stored and deflated), duplicates, non-UTF-8, non-zip. Limits at bound and one over: 1000/1001 entries (reader and writer), 1024/1025 name bytes counted as UTF-8 (512 x "ő"), 16 MiB / 16 MiB+1 entry (reader and writer), total via a passed `maxTotalBytes: 10`; passed limits 0, -1, 1.5, NaN, Infinity, 0x10000 and a string refused. No timing asserts.
- Verified: `pnpm test` 48/48, `pnpm lint` clean, `pnpm build` ok. `node scripts/run.mjs checks` fails only on `modules/profile-catalogue-data/package.json` licence (not this card).
- Shared-file lines for the coordinator, `vsslicer/modules/profiles-cura/src/index.ts`:
  ```ts
  export {
    CURA_ARCHIVE_LIMITS,
    CuraArchiveError,
    readCuraProfileArchive,
    resolveLimits as resolveCuraArchiveLimits,
    unsafeEntryName,
    writeCuraProfileArchive,
  } from './adapters/archive/curaprofile-archive.ts';
  export type { CuraArchiveLimits, CuraProfileEntry } from './adapters/archive/curaprofile-archive.ts';
  ```
  CHANGELOG (Unreleased, Added): `- Read and write .curaprofile archives (flat STORED entries named by profile id, UTF-8 text, as Cura writes them) with entry-count, name-length, entry-size and total-size limits enforced while inflating.`

**Review passed (sp9-rev-prf-131)** 2026-10-26

- Ran in `vsslicer/modules/profiles-cura`: `pnpm test` 48/48 (4 files), `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` ok. `node scripts/run.mjs checks`: runner tests 82/82; `check-licence` reports 13 problems, all in `modules/profile-catalogue-data` (another card's), none in profiles-cura.
- Upstream (Cura@5bea2f8, read only): `CuraProfileWriter.py:25` opens `ZipFile(..., compression=ZIP_DEFLATED)`, `:30-31` passes `zipfile.ZipInfo(profile.getId())` to `writestr`. Confirmed against the CPython `zipfile.py` source (read, Cura not run): `writestr` sets `zinfo.compress_type = self.compression` only `if not isinstance(zinfo_or_arcname, ZipInfo)`, and `ZipInfo.__init__` defaults `compress_type = ZIP_STORED`, date 1980-01-01. The worker's STORED claim holds. `CuraProfileReader.py:41-44` reads every `namelist()` entry as UTF-8 named by profile id; the writer and reader match. The Cura 2.1 bare-file fallback (`:54-58`) is left out with a `shortcut:` comment.
- Hostile probes (own archives, src imported by absolute path, in a mktemp dir, deleted): overlapping entries (same local offset, partial overlap) refused; CRC mismatch refused; truncated deflate refused; `a/./b`, `a//b`, `" "`, `.`, `..`, `C:`, `\\srv\x`, NUL refused; NFC/NFD duplicate refused; five entries declaring 64 MiB + 1 in total refused before inflating; 64 KiB + 1 of zeros (ratio > 100:1) refused; 200 MiB of zeros deflated to 200 KB with a declared size of 1000 stops with "inflates past"; EOCD count 1000 over a 1-record directory, cd/local offsets past the file, ZIP64 marker, empty and garbage input, method 99, all refused with a message. An EOCD claiming 1 of 10 000 records reads 1 (only declared records are trusted; fine).
- Mutation run (19 mutants of `src/adapters/archive/curaprofile-archive.ts` in the copy): 16 killed by the card's tests. 3 survive, with behaviour still correct per the probes above: (1) the overlap check (`:191-194`) has no test; (2) the CRC check (`:200`) has no test; (3) removing the `^[. ]*$` segment rule (`:83`) survives because `..` is still caught by the trailing-dot rule and the test regex `/\.\./` (`test/curaprofile-archive.test.ts:118-119`) matches the echoed name, not the reason. Suggested follow-up (not blocking, ACs are met): add an overlapping-entries test and a CRC-mismatch test, and match the reason text in the traversal cases.
- Observation: the 64 KiB input slices bound one `Inflate.push` to about 66 MB of transient output before the size check sees it (deflate's ~1032:1 ceiling); bounded, as the code comment says.
- No fixes made in place.
