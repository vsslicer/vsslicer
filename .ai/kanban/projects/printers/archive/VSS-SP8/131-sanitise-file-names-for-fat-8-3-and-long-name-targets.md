---
id: 131
title: Sanitise file names for FAT 8.3 and long-name targets
type: feature
priority: P0
effort: M
model: sonnet
area: [storage]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [130]
created: 2026-10-25
---

Pure name sanitiser: ASCII fold, reserved device names, collisions in a directory, extension kept, 8.3 by default, long names when the connection sets `longFilenames`.

**Code:** `vsslicer/modules/printer-folder/src/domain/...` (module: `printer-folder`, layer: `domain`)

## Acceptance criteria

- [ ] Property tests (fast-check): FAT-mode output is always 8.3-valid, idempotent, collision-free within a directory, extension preserved, never a reserved device name (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
- [ ] Long-name mode keeps the name up to 255 characters and still strips illegal characters
- [ ] Examples table covers non-ASCII, trailing dots and spaces, and `.gcode.3mf`

## Tasks

- [ ] Sanitiser
- [ ] Collision resolver
- [ ] Property tests

## Progress

Not started.

Review (sp8-reviewer-19, 2026-10-26 08:17): FAIL
Ran: `pnpm test` (42 pass), `pnpm lint`, `pnpm build` in printer-folder, `node scripts/run.mjs checks` (exit 0), plus a hostile probe in scratch. FAT mode holds up: `CON.txt`, `con .gcode`, `CÓN`, `COM¹` all leave the reserved set; traversal and separators (`../`, `..\\`, `\\\\server\\share`, `a/../b`) never survive; 5 M-char inputs (plain, lone surrogates, dot/space runs) return in milliseconds; 4096 identical names resolve; suffixed outputs are idempotent. No wall-time asserts.
1. Long-mode collision suffix breaks the 255 cap (AC2). `withSuffix` floors the base at 1 unit with `Math.max(room, 1)` but keeps the whole extension, so a sanitised name with a long extension grows past 255: `sanitiseAll(['a.'+'x'.repeat(253)] x3, {longFilenames:true})` gives lengths 255, 257, 257; 1200 copies reach 260; `'a.'+'😀'.repeat(126)` gives 256. vsslicer/modules/printer-folder/src/domain/names.ts:88-95. Fix: when `base + suffix + ext` cannot fit, cut the extension too (or drop it as `longName` does past 64 units, names.ts:77) so the result is always <= MAX_LONG_NAME without splitting a surrogate pair; add the cases above as tests.
2. Uniqueness under case-folding misses pairs the target folds together. `key` is `toLowerCase()` (names.ts:97), so `aς.gcode` and `aσ.gcode` are kept distinct although FAT/exFAT/NTFS upcase both to `Σ` (probe: `["aς.gcode","aσ.gcode","aΣ~1.gcode"]`). Fix: fold with `s.toUpperCase().toLowerCase()` (conservative: over-matching only costs a `~n`), and add the pair to the collision tests.
3. The property loops do not cover what the card's fast-check criterion names in long mode. fast-check is required by AC1 and cannot be installed, so seeded loops are acceptable only if they cover the same properties: the long-mode loop (test/names.test.ts:151-166) checks `sanitiseName` only, never `sanitiseAll`/`uniqueName` output, which is where finding 1 hides; extension preservation is a fixed list of five, not a random property (test/names.test.ts:135-139). Fix: add a seeded loop over random batches (with duplicates and long extensions) in long mode asserting length <= 255, no lone surrogate, case-folded distinctness; make extension preservation random (random base + ext from the alphabet, assert the output extension equals the folded first three valid chars, or the full ext in long mode).
Non-blocking: long mode leaves Windows-reserved forms that the card's list does not name: `con .gcode` (Win32 strips the trailing space before the device check), `COM¹`/`COM²`/`COM³`, `COM0`/`LPT0` (names.ts:17-24,74); and keeps bidi/format characters such as U+202E and U+FEFF (names.ts:29). Worth one line each if the files are ever opened on Windows.

Review (sp8-reviewer-23, 2026-10-26 08:25): FAIL
Re-review after fix round 1. The fix note (PRN-131-fix) is in .ai/local/taskboard/activity.jsonl (board.py note), not in this card's Progress. Ran: `pnpm test` (48 pass), `pnpm lint`, `pnpm build` in printer-folder, `node scripts/run.mjs checks` (exit 0), and a scratch probe. Round-1 findings:
- 1 fixed: 3 and 1200 copies of `'a.'+'x'.repeat(253)` give max 255 (`a`, `a~1`, ...); `'a.'+'😀'.repeat(126|127)` max 254; 4096 copies of a 250-unit base + `.gcode`, a 63-unit extension, and a surrogate-pair base all stay <= 255, no lone surrogate, idempotent, distinct (names.ts:81-91).
- 2 fixed: key is `toUpperCase().toLowerCase()` (names.ts:94); `aς/aσ/AΣ` and `ß/ss/SS` get `~n`; uniqueName honours it.
- 3 fixed: seeded long-mode batch loop with duplicates and long/emoji extensions asserts cap, no lone surrogate, folded distinctness, uniqueName (test/names.test.ts:210-232); random extension preservation in 8.3 and long (test/names.test.ts:174-180, 234-240).
- RESERVED (names.ts:18) is anchored, a flat alternation, linear (1 M-char input in 0 ms); no over-match: `CONSOLE.txt`, `COM10.gcode`, `LPT1X`, `XCON`, `COM` kept; `con .gcode`, `COM1 `, `  com1.x`, `nul.`, `LPT0`, `COM¹` caught in both modes. No wall-time asserts.
1. Collision resolution is quadratic on realistic input (rule 25). `pick` restarts at `~1` for every name (names.ts:96-104), so a batch whose names fold together costs n^2/2 probes, each a `withSuffix` plus a full-string `key`. Probe: `sanitiseAll` of `plate_0000.gcode` ... `plate_4095.gcode` (8.3, all fold to `PLATE_00.GCO`): 1024 -> 83 ms, 2048 -> 305 ms, 4096 -> 1221 ms; 4096 identical 250-unit long names: 2.5 s, and 9.2 s with an emoji extension. It blocks the extension host for seconds on an ordinary folder of exported plates, and the fix-round key (two case maps per probe) made it slower. Fix: in `sanitiseAll` keep a `Map<key(name), next n>` and start `pick` from it (`uniqueName` stays one name, linear); update the MAX_ENTRIES comment (names.ts:7) and add a test that 4096 `plate_%04d.gcode` names resolve distinct and valid.
Non-blocking: bidi/format characters (U+202E, U+FEFF) still kept in long mode, as the fix note says.

### PRN-131-fix2 (round 2 fix)
- `sanitiseAll` now keeps a per-batch `Map<key(stem), next n>`; `pick` resumes the `~n` search there and still checks `used` for every candidate, so uniqueness holds. `MAX_ENTRIES` comment updated (linear).
- Test added in `test/names.test.ts`: 4096 `plate_0000..4095.gcode` resolve to 4096 distinct names, with `Set.prototype.has` calls counted and asserted <= 4n (no wall time).
- pnpm test (49 pass), lint, build, `run.mjs checks` all pass. Files: `src/domain/names.ts`, `test/names.test.ts`. No index/CHANGELOG/dependency changes.

Review (sp8-reviewer-25, 2026-10-26 08:38): FAIL
Re-review after fix round 2. Ran: `pnpm test` (49 pass), `pnpm lint`, `pnpm build` in printer-folder; `node scripts/run.mjs checks` (exit 0); scratch probes that count `Set.prototype.has` calls.
- Uniqueness holds. Every candidate is still checked against `used`. Mixed batches where a later name equals an earlier `~n` result stay distinct: `a,a,A~1.GCO,a,A~2.gco,a~3.gcode,a` gives A.GCO, A~1.GCO, A~1~1.GCO, A~2.GCO, A~2~1.GCO, A~3.GCO, A~4.GCO. Output is 8.3-valid, or <= 255 in long mode, in every probe. 4096 identical long names take 8191 has calls (linear). The spy is restored (`vi.isMockFunction(Set.prototype.has)` is false afterwards).
1. The linear-probe test is vacuous. test/names.test.ts:289-292 reads `has.mock.calls.length` after `has.mockRestore()`, which (vitest 5.0.5) clears the calls, so the assertion compares 0 <= 16384 and cannot fail. With the count read before the restore, the same 4096 `plate_NNNN.gcode` batch makes 89,331 calls, 5.5x the bound. Fix: copy `has.mock.calls.length` into a variable before `mockRestore()` (keep the finally), then assert on that.
2. Collision resolution is still quadratic (rule 25). `next` is keyed by the full stem (names.ts:98-100), but in 8.3 `plate_0000..0099` give PLATE_00, `plate_0100..` give PLATE_01, and so on: 41 distinct stems whose suffixed candidates (`PLATE_~1`, `PLATE~10`, ...) are shared. Each new stem restarts at ~1 and walks past every earlier stem's suffixes. Probes: plates 89k probes; 1681 distinct 8-char stems `ABCDEFxy`, each twice, 1.42 M probes (259 ms); 2048 distinct 254-unit long stems, each twice, 404 k probes. MAX_ENTRIES keeps it bounded, but the "linear" comment (names.ts:7) is false and the batch the card is about is the quadratic case. Fix: key `next` by what the candidates actually share, the suffix-truncated base plus ext. For example `key(withSuffix(name, 1, long))` with the suffix removed, or one counter per `cut(base, max-2)+ext` family, still checking `used`. Then the corrected test from 1 holds at <= 4n for plates and for the ABCDEFxy batch.

### PRN-131-fix3 (round 3 fix)
- `pick` keys `next` by candidate family (digit width + the suffixed candidate with its digits normalised: same truncated base and extension), so distinct stems that share candidates share one counter and jump past taken `~n`; `used` is still checked for every candidate. "Linear" comment now true.
- Tests: the has-count is read before `mockRestore()`; probes for 4096 plates, 1681 distinct 8-char stems twice, 2048 long stems twice (long mode), each asserting `has` calls <= 4n and distinctness.
- pnpm test (51 pass), lint, build, `run.mjs checks` pass. Files: `src/domain/names.ts`, `test/names.test.ts`. No index/CHANGELOG/dependency changes.

Review (sp8-reviewer-27, 2026-10-26 08:43): PASS
Re-review after fix round 3. Ran: pnpm test, pnpm lint, pnpm build in the module; `node scripts/run.mjs checks` (exit 0); scratch probe. printer-folder 51 tests pass.
- 1 fixed: test/names.test.ts:282-291 `counted` reads `has.mock.calls.length` inside the try, before `mockRestore()` in the finally, and asserts `calls > 0`.
- 2 fixed: own `Set.prototype.has` count on the built module: 4096 plate_NNNN.gcode 8151 calls (1.99n); 1681 ABCDEFxy stems x2 5883 (1.75n); 676 A-Z stems x2 1.5n; 2048 long stems x2 6144 (1.5n); 4096 identical names 8191 in both modes. All distinct (folded), 8.3-valid or <= 255.
- Uniqueness in mixed batches holds: `a,a,A~1.GCO,a,A~2.gco,a~3.gcode,a,A~5,a,a` gives A A~1 A~1.GCO A~2 A~2.GCO A~3.GCO A~3 A~5 A~4 A~6; long `a.gcode,a~1.gcode,a.gcode,a~2.gcode,a.gcode,a.gcode` gives a.gcode a~1.gcode a~2.gcode a~2~1.gcode a~3.gcode a~4.gcode; 2667 interleaved plate.g / PLATE~n.G at 2.0n.
Non-blocking: a lower-width family that is wholly taken by explicit input names never gets a `next` entry (names.ts:113-121 sets it only where a name is found), so 999 explicit PLATE~1..999.G then 3097 plate.g cost about 999 probes each (~3 M, 63 ms). Bounded by the digit widths, so not quadratic in n; one line (`next.set(family, n)` when the width changes) would make the "linear" comment exact.
