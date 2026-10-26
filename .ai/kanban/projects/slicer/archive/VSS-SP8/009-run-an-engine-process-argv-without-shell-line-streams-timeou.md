---
id: 9
title: "Run an engine process: argv without shell, line streams, timeout, exit and signal result"
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [8]
created: 2026-10-25
---

Spawns a child process from an argv array (never a shell), streams stdout and stderr as lines, enforces a timeout and returns exit code or signal.

**Code:** `vsslicer/modules/slicer-runtime/src/adapters/...` (module: `slicer-runtime`, layer: `adapters`)

## Acceptance criteria

- [x] Stub-binary tests on all three OS runners: exit code, signal (POSIX), timeout, large output without a deadlock
- [x] No shell is involved: an argument with spaces, quotes and `;` reaches the child unchanged (test)
- [x] A hung child is killed when the timeout expires and the result says so

## Tasks

- [ ] Runner
- [ ] Line splitter
- [ ] Stub binaries and tests

## Progress

Not started.

SLC-9-worker: added `src/adapters/run-process.ts` (runProcess, LineSplitter) and `test/run-process.test.ts` (16 tests pass incl. layers/domain; lint, build, `checks` pass). Bounds: line cut at maxLineLength (default 64 KiB, memory O(max)), kept lines maxLines 10k / maxOutputChars 4 MiB, onLine is synchronous so nothing queued; SIGTERM then SIGKILL after killGraceMs on a POSIX process group (Windows: child.kill only, no tree kill; Windows CI unverified); NUL refused; shell:false. Tests use process.execPath -e, no wall-time asserts, 60 s hang guards.
Lines for index.ts: `export * from './adapters/index.ts';`
CHANGELOG Unreleased: `- runProcess: spawn an engine from an argv array (no shell) with line streams, size bounds, timeout kill (process group) and exit/signal result.`

Review (sp8-reviewer-21, 2026-10-26 08:20): FAIL
Ran: `pnpm test` (16 pass), `pnpm lint`, `pnpm build`, `node scripts/run.mjs checks` (all green); hostile probe in scratch against `src/adapters/run-process.ts`. Passing probes: 100 MB with no newline keeps one 64 KiB line, splitter partial stays at max, RSS +6 MB; 500k lines keeps 10 000; UTF-8 split at every byte offset and byte-at-a-time decodes right; `\r\n` stripped, lone `\r` kept; SIGTERM-ignoring child gets SIGKILL; grandchildren killed; no timer left after a fast exit; ENOENT, EACCES, missing cwd, NUL in arg/cwd/env key/env value all reject; `shell: false` is the only spawn option (grep). Tests assert no wall time (rule 5). Layers fine; only `src/adapters/index.ts` barrel touched. "All three OS runners" is carried: macOS only, Windows/Linux runs owner-blocked (Q15/Q16), not counted as a fail.
1. run-process.ts:136: `timeoutMs` is not validated. `Infinity`, `NaN`, `2**31` (and <= 0) make Node fire the timer after 1 ms, so the engine is SIGTERMed at once with `timedOut: true` (probe: 2 ms). A caller passing `Infinity` for "no limit" or a long slice timeout gets its engine killed. Fix: reject unless `Number.isFinite(t) && t > 0 && t <= 2**31-1` (same for `killGraceMs`), with a test.
2. run-process.ts:124: after one line is refused by `maxOutputChars`, later shorter lines are still kept, so `lines` gets a silent hole (probe: `a`, 50x`x`, `b` with max 10 keeps `["a","b"]`), contradicting the `outputTruncated` doc "stopped growing". Fix: once truncated, keep nothing more (`if (!outputTruncated && ...)`), with a test.
3. run-process.ts:128: an exception from `onLine` is thrown inside the stream `data` listener and becomes an uncaughtException (would take down the extension host); the promise still resolves. Fix: catch it, kill the tree, reject with that error; test.
4. run-process.ts:71: the cut at `maxLineLength` can split a surrogate pair, leaving a lone high surrogate (probe: `😀` with max 1 gives `\ud83d`). Fix: drop the last unit when it is a high surrogate; test.
5. Test gaps (add with the fixes): EACCES rejection, and exit before timeout leaving no pending timer (e.g. resolved with `timedOut: false` and a large `timeoutMs`).

Review (sp8-reviewer-24, 2026-10-26 08:30): PASS
Re-review after fix round 1. The fix note was not in Progress; I checked the fixes against the code instead. Ran in the module: `pnpm test` (31 pass), `pnpm lint`, `pnpm build`, all exit 0. From `vsslicer/`: `node scripts/run.mjs checks`, exit 0. Scratch probe against `src/adapters/run-process.ts`, with `process.on('uncaughtException')` armed (count stayed 0):
1. Fixed (run-process.ts:106-113): timeoutMs Infinity/NaN/0/-1/1.5/2^31/'5' rejected, 2^31-1 runs (timedOut false); killGraceMs Infinity/NaN/0/2^31 rejected. Tests at test:93-101.
2. Fixed (:141): `a`, 50x`x`, `b`, stderr `c` with maxOutputChars 10 keeps `["a"]`, outputTruncated true; maxLines 2 keeps the first two. Test at test:103.
3. Fixed (:145-150, :177): an onLine throw on stdout, on stderr and on the final unterminated line (flushed in end()) rejects with that error. onLine is called once, the child is gone (ESRCH) and nothing is uncaught. Test at test:109.
4. Fixed (:78): no lone surrogate for max 1/2/3 on `😀`, `a😀b`, `😀😀`, also fed one byte at a time. Test at test:155.
5. Fixed: EACCES test (test:126) and timer cleared on early exit (test:138). Probe: timeoutMs 2^31-1 resolves in about 0.1 s and the probe process exits without waiting.
Regressions: none. 100 MB with no newline keeps one 65536-char line, longLines 1, RSS +4.4 MB. A child that ignores SIGTERM is SIGKILLed. Grandchildren are killed both on timeout and after a normal parent exit. Still carried, not a FAIL: "all three OS runners" (macOS only, Q15/Q16).
Non-blocking: `maxLineLength`/`maxLines`/`maxOutputChars` are not validated. With `maxLineLength: NaN`, `room` is NaN and the line bound is off. These are caller options, not untrusted input. Worth a follow-up validation like the timeout check.
