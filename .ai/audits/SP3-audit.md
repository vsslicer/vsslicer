# SP3 audit

Date: 2026-10-25. Range: `git diff 38e4938..95c8008 -- vsslicer/ .github/workflows/ci.yml` (33 commits).
Auditor: fresh Opus agent that wrote none of SP3's code. Read-only: no code changed.
Scope: `vsslicer/scripts/` (run.mjs, versioning.mjs, lib.mjs), tooling 0.8.2, gcode-parser 0.8.5, gcode-bgcode
0.4.1, gcode-api 0.4.1, the example / example-extension / test-vscode / test-webview patch releases, new
gcode-planner 0.2.1, new webview-kit 0.4.2, `.github/workflows/ci.yml`.
Method: `/ponytail:ponytail-audit`, plus probes in a `git worktree` under `mktemp -d` (removed afterwards). The
local registry was only read from (installs); nothing was published and it was not stopped.
Already carded for SP4 and not re-reported: GCP-82, GCP-83, GCP-84, GCP-30, PLT-181.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. SP3 added
the print-time planners (constant speed, Klipper, Marlin 2 and Prusa Buddy) in `gcode-planner`, the webview
kit (message envelope, handshake, CSP and HTML helper, chunked transfer with acks, host and webview
adapters), .bgcode-to-.gcode conversion, and runner checks for stale lockfile pins and missing `prepack`.

Load assumed: one person on a desktop, G-code files up to several hundred MB (some untrusted), one webview
per open file that may reload many times in a session; CI on shared GitHub runners.

## Earlier audit (SP2-audit.md): the fixes hold

1. Stale lockfile pins: ran the real `lockfileIntegrities` + `stalePinProblems` over every module: no problems;
   every `@vsslicer/*` pin is the current version. The check runs in `ci` (`scripts/run.mjs`). Held.
2. Load-sensitive parser tests: 30 s bound with 60 s timeout in `gcode-parser/test/summary.test.ts`, 60 s on the
   worker corpus test. Held.
3. Missing `prepack`: `prepackProblems` reports nothing for any module, and is enforced in `ci`. Held.
4. DCO: carded as PLT-181 (owner question Q12). Not re-checked.
5. Summary holes: `Array.from(this.extruders, (e = {}) => ...)` in `gcode-parser/src/domain/summary.ts`, tested
   with `nan` and empty slots. Held.
6. Integration tests in CI: `ci.yml` runs `run.mjs test:integration --changed` on every OS (xvfb on Linux) with
   the shared VS Code cache; the large-fixture cache is gone; `scripts/test/ci-integration.test.mjs` guards it. Held.
7, 8. Packaging tool errors and bundle metafile path (PLT-183, PLT-184): tests added in
   `tooling/test/notices.test.mjs` and `bundle.test.mjs`. Held (read, not re-probed).
9. Lockfile fetch retry: both fetches use `fetchRetry` from `scripts/lib.mjs`. Held.
10. Runner path: `runnerPath(import.meta.url)` via `fileURLToPath` in `test-vscode/src/versions.ts`. Held.

Test runs (scratch worktree, frozen-lockfile installs): webview-kit 95, gcode-planner 46, gcode-bgcode 39,
scripts 47 pass / 8 skipped, all green.

## Must fix

None found.

## Should fix

1. **The Klipper planner returns `NaN` for the whole print when max velocity or accel is 0** (`gcode-planner/src/domain/klipper.ts:L253-L270`, `gcode-planner/src/domain/limits.ts:L201-L202`)
   - **What this is:** the Klipper planner reads max velocity and accel per move, from a user override or the
     file's `SET_VELOCITY_LIMIT` / `M204`. `resolveLimits` validates overrides.
   - **Problem:** `resolveLimits` accepts an override of `0` for every field ("finite number >= 0"), while the
     config-block reader (`configValue`, `limits.ts:L175-L179`) rejects 0 except for `ZERO_VALID` keys: the same
     rule applied two ways. With `override: { accel: 0 }` or `{ maxVelocity: 0 }` Klipper's `totalTime` is `NaN`.
     A file line `SET_VELOCITY_LIMIT VELOCITY=0` does the same: the parser passes 0 through
     (`gcode-parser/src/domain/machine.ts:L324-L329`, no range check) and the planner guards `s > 0` for accel
     but not `v` for velocity. One bad line poisons every later start time and layer time.
   - **How verified:** scratch vitest over all four planners with degenerate inputs: Klipper gives `NaN` for a
     `MaxVelocity` 0 state change and for `accel` / `maxVelocity` overrides of 0; Marlin and Buddy stay finite;
     F0, zero-length, E-only and empty files are fine for every planner.
   - **Fix:** in `resolveLimits`, reject an override that `configValue` would reject (reuse its rule, one
     place). In `klipper.ts`, ignore a non-positive file velocity the way accel is already ignored
     (`v > 0 ? v : th.maxVelocity`), as Klipper itself refuses `VELOCITY=0` (`above=0.`). Add both cases to
     `test/klipper.test.ts`.
   - **If we skip it:** a typo in a settings field or one odd macro line shows "NaN" as the print time, and the
     timeline scrubber built on start times breaks.
   - **Priority:** P1. **Board:** GCP. **Module:** gcode-planner (domain).

2. **A webview that reloads and reuses a stream id hangs for 30 s, and the data never arrives** (`webview-kit/src/application/transfer.ts:L116-L136`, `webview-kit/README.md:L86`)
   - **What this is:** `receiveBuffers` remembers the ids of the last 256 finished streams, so late duplicate
     chunks cannot reopen them. The README says a `stream` id "must be unique per sender".
   - **Problem:** the host's receiver lives as long as the panel, but a webview restarts on every reload (the
     handshake is built for that). A webview that numbers its streams from a per-load counter (`file-1`, ...)
     reuses ids after a reload; the host silently ignores every chunk of the reused id, and the sender fails
     with `TimeoutError` after `timeoutMs`.
   - **How verified:** scratch vitest with `test/pair.ts`: one `receiveBuffers`, `sendBuffer(web, 'file-1', 10 B)`
     succeeds, a second `sendBuffer(web, 'file-1', 20 B)` (the "reloaded" webview) rejects with `TimeoutError`;
     the receiver got only the first buffer.
   - **Fix:** smallest: say in the README and the `sendBuffer` doc that ids must be unique for the receiver's
     lifetime, and show `crypto.randomUUID()` (or the handshake session as prefix) in the example. Better and
     still small: clear the `closed` set in the host whenever a new handshake session starts.
   - **If we skip it:** the first viewer that reloads its webview and re-requests a file gets a 30 s hang and an
     empty view, which looks like a transfer bug.
   - **Priority:** P1. **Board:** PLT. **Module:** webview-kit (application, docs).

3. **.bgcode to .gcode conversion runs at about 14 MB/s because of two byte/string copies** (`gcode-bgcode/src/domain/ascii.ts:L80-L85`, used by `src/application/to-gcode.ts:L56-L57`)
   - **What this is:** every decoded G-code block is turned into a one-char-per-byte string, blank lines are
     dropped, and the string is turned back into bytes.
   - **Problem:** `latin1ToBytes` uses `Uint8Array.from(s, mapFn)` (22 MB/s) and `bytesToLatin1` uses
     `String.fromCharCode(...spread)` (50 MB/s). Blank-line dropping itself runs at 435 MB/s. A .bgcode whose
     text twin is 100 MB spends about 7 s here before the parser sees a byte; GCP-84 puts this on the open path.
   - **How verified:** scratch benchmark over 100 MB of 64 KiB G-code blocks: whole round trip 14 MB/s; a plain
     `for` loop with `charCodeAt` for `latin1ToBytes` runs at 486 MB/s.
   - **Fix:** replace `Uint8Array.from(...)` with a preallocated `Uint8Array` and a `for` loop (two lines). Same
     for `bytesToLatin1` if it still shows in a profile, or drop blank lines on the bytes directly and skip both
     copies.
   - **If we skip it:** opening a large .bgcode takes several seconds longer than the same .gcode.
   - **Priority:** P1 (before GCP-84 lands). **Board:** GCP. **Module:** gcode-bgcode (domain).

## Nice to have

None reported. Smaller notes left out: 2 (host `serveHandshake` calls `onMismatch` once per mismatched
message, so a burst from an old webview can trigger several reloads; `createWebviewHtml`'s `style-src` has no
`'unsafe-inline'`, unverified against VS Code's injected default styles).

Verdict: healthy; fix 1 (NaN print time) first, then 2 and 3 before the viewer and GCP-84 build on them.

Not checked: Klipper / Marlin / Buddy planner accuracy against real firmware or real prints (only invariants
and degenerate inputs were probed); tooling 0.8.2 bin changes were read, not re-run; the VS Code integration
tests and CI on Windows/macOS were not run; webview-kit in a real VS Code webview (only jsdom and in-memory
pairs); research docs and board changes in the range.

## Cards

All in SP4, `model: sonnet`, linking this report:

- Finding 1 (P1): GCP-85, Guard the Klipper planner against zero accel or velocity (gcode-planner)
- Finding 2 (P1): PLT-187, Deliver a reloaded webview's reused stream ids (webview-kit)
- Finding 3 (P1): GCP-86, Speed up latin1 conversion in the bgcode-to-gcode twin (gcode-bgcode)

