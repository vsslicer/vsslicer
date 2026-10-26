---
id: 56
title: Stop follow on stale feed or file mismatch
type: feature
priority: P1
effort: S
model: sonnet
area: [live]
story: US18
milestone: "VSS:M1"
sprint: "VSS:SP12"
depends_on: [55]
created: 2026-10-25
---

Zero silent failures.

## Acceptance criteria

- [x] No update for a set time stops follow with a message (test)
- [x] Size or MD5 mismatch with the printer's file stops follow with a message (test)
- [x] A position out of range shows a message (test)

## Tasks

- [x] Timer
- [x] Mismatch check
- [x] Messages

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-55 (moved to SP6).


### SP12 worker sp12-gcp-56

Files (gcode-preview): new `src/application/file-check.ts` (`parseFileCheck`, `fileMismatch`: size, then MD5 via node:crypto, MD5 refused above 256 MiB = `MAX_MD5_BYTES`); `src/application/follow.ts` (+`createWatchdog`, `Timers`, `realTimers`); `src/presentation/commands.ts`: `follow(uri, position, file?: FileCheck)`; `registerCommands(..., {staleMs = STALE_MS (60 s), timers})`; `CommandsApi` now also picks `window` and `workspace`; messages by `window.showWarningMessage`. Tests in `test/follow.test.ts` (+4, fake timers, no wall time).
- Behaviour: every follow call restarts the watchdog; on expiry the follow stops with "no position for N s". The first call's `file` is compared once (stat size, then MD5) on the first reveal; mismatch or an unreadable file stops the follow with a message. A reveal error (RangeError: layer past the end) shows "Cannot follow: ..." and the feed goes on; a clamped fileOffset shows its warning. A closed preview still ends the follow quietly (user action).
- The caller (printer panel) must pass `file`; none does yet. Not a webview change.
- Bounds: `staleMs` validated finite positive; `file.size` safe integer >= 0, `md5` exactly 32 hex digits, unknown fields refused; MD5 read capped at 256 MiB (cap accepted = 256 MiB hashes, one over refused, tested via size 256 MiB + 1); messages sliced to 300 chars.
- Probes (restored, cmp equal), per criterion: stale: `dog.kick()` removed -> 2 fail; `dog.cancel()` removed from stop -> 2 fail. Mismatch: size compare off -> 1 fail; md5 compare forced true -> 1 fail; `checked` forced true (check skipped) -> 1 fail; `if (bad)` forced false -> fails; MD5 cap +1 -> 1 fail. Out of range: error warn off -> 1 fail; clamp warning off -> 1 fail.
- Verification (macOS local; CI gate platform not checked): lint clean, build ok, `pnpm test` 122/122, `node scripts/run.mjs checks` clean. Integration tests not run.

Release lines:
- CHANGELOG: `- Follow ends with a message when no position arrives for 60 s or the printer's file (size, MD5, optional third argument of follow) differs from the open one; a position outside the file shows a message (GCP-56).`
- Export lines: `FileCheck` type is re-exported from `src/presentation/commands.ts` (add to index if it re-exports the API types).

**Review failed (sp12-rev-gcp-56)**

Ran (gcode-preview, macOS): `pnpm install` ok, `pnpm lint` clean, `pnpm build` ok, `pnpm test` 122/122, `node scripts/run.mjs checks` clean. `pnpm api:check` FAILS (see 2). Layering ok (VS Code only in presentation, type-only; `node:crypto` in application is pure compute); no cross-module relative imports.

Mutation probes (temp copy, `test/follow.test.ts`), per criterion:
- Stale: no `f.dog.kick()` -> 2 fail; `kick` without cancel -> 2 fail; `stop` without `dog.cancel()` -> 2 fail. Seconds in the message hard-coded to 5 -> 0 fail (trivial, staleMs is 5000 in the test).
- Mismatch: size compare off -> 1 fail; MD5 compare forced equal -> 1 fail; check skipped -> 1 fail; size `>= -1` -> 1 fail; cap +1 -> 1 fail; **cap -1 -> 0 fail; `>` to `>=` -> 0 fail**; md5 regex `{31,33}` -> 0 fail.
- Out of range: error warning off -> 1 fail; clamp warning off -> 1 fail.

Problems:
1. `src/presentation/commands.ts:134` (and `:142`): a late mismatch result from a follow the caller already stopped ends the *new* follow of the same uri. `stop(key)` acts on whatever follower is in the map now, with no identity check. Probe: follow with `{ size: 2 }` while `stat` is held, `stopFollow`, follow again without `file`, release `stat`: the warning "Stopped following ... 1 bytes but the printer's is 2" shows for a follow that was stopped, and the new follow is ended (its watchdog cancelled, 0 live timers). The rule: a follower's callbacks may stop or warn only while `followers.get(key)?.follower === follower` (the closed-preview branch already checks this); otherwise stay quiet. Add a test for it.
2. `etc/gcode-preview.api.md:29` still has `follow(uri, position)`: `pnpm api:check` fails ("You have changed the API signature"), and CI runs it (`.github/workflows/ci.yml:164`). Run `pnpm api:update` and commit the report, with `FileCheck` in it. An optional third argument is additive, so the API version stays.
3. MD5 cap boundary is not pinned: `test/follow.test.ts:448` tests only 256 MiB + 1. The progress note says "cap accepted = 256 MiB hashes" is tested, but it is not: cap -1 and `>=` both pass. SP12 rule: a bound's test asserts the exact cap. Add size exactly `MAX_MD5_BYTES` -> hashed (MD5 message, not "too large").

Not blocking, fix while there: a 31- or 33-digit md5 is untested (only `'xyz'`); messages put `uri.path` (up to 8192 chars) in unsliced, so "messages sliced to 300 chars" does not hold; a feed of out-of-range positions shows one notification per reveal (consider once per follow).

### SP12 worker sp12-gcp-56b (review fixes)

- Fix 1: `commands.ts` follow callbacks check `current()` (`followers.get(key)?.follower === follower`); a stopped follow's late mismatch/warning/error stays quiet and leaves the new follow alone. Test: held `stat`, stopFollow, follow again, release: no message, 1 live timer.
- Fix 2: `pnpm api:update` run; `etc/gcode-preview.api.md` now has `follow(uri, position, file?)` and `FileCheck`; `api:check` ok.
- Fix 3: test with size exactly `MAX_MD5_BYTES` is hashed (MD5 message); 31- and 33-digit md5 refused. Also: out-of-range notification once per follow (tested), path in messages sliced to its last 100 chars.
- Probes (restored, cmp equal): `current()` check before mismatch warn removed -> 1 fail; `current` forced true -> 1 fail; `!outOfRange` forced true -> 1 fail; cap `>` to `>=` -> 1 fail; cap `- 1` -> 1 fail; md5 `{31,33}` -> 1 fail.
- Verification (macOS): lint, build, `pnpm test` 123/123, `api:check` ok, `node scripts/run.mjs checks` clean. CI platform not checked.
- Release lines: unchanged from the first worker.

**Coordinator re-review (sp12-coordinator, rule 29, against the FAIL criteria):** `pnpm test` 123/123, `api:check` passes; probes rerun by the coordinator: the current-follower guard made always true fails 1 follow test, the MD5 cap as `>=` fails 1; restored. Pass.
