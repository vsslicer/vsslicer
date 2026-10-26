---
id: 124
title: Fix the timeline integration test that fails on both VS Code versions
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

The gcode-preview integration test "plays, pauses, steps and changes speed" (timeline) fails or times out on VS Code stable 1.143.1 and 1.100.0, with or without GCP-53's tests (GCP-53 worker and reviewer, SP11), so `pnpm test:integration` is red.

**Code:** `vsslicer/modules/gcode-preview/test/integration/` (module: `gcode-preview`, layer: presentation tests)

## Acceptance criteria

- [x] The cause is found and fixed (the test waits on state, not on time; rule 26)
- [x] `pnpm test:integration` passes 3 runs in a row on both VS Code versions

## Progress

Cause (SP11 audit item 11, confirmed by reading): the test chains about ten `until` waits plus a real-time play to the end of a 16 min print at 500x (about 2 s of playing), all inside the runner's 20 s mocha timeout, so a loaded machine overran it. All waits already poll state; none waits on time except the 500 ms "stands still" check. I could not reproduce the red run here: the unchanged test passed on 1.100.0 and stable in 3 runs (about 3.6 s and 2.7 s for the test), so the cause is load-dependent and not reproduced.

Fix in `test/integration/preview.test.ts`: the test is `async function` with `this.timeout(60_000)`, and it sets speed 2000 (the top of SPEEDS in timeline.ts) before the final play, cutting the real play time to about 0.5 s.

Verification: `pnpm test:integration` 3 runs in a row after the change, each on 1.100.0 and stable: all 15 passing (timeline test 1.7 to 2.8 s). `pnpm lint` clean, `pnpm test` 118 pass, `node scripts/run.mjs checks` passes. CI gate platform: not run here (macOS local).

Probes (per criterion): (1) cause/fix: removing `this.timeout(60_000)` or the 2000 speed cannot fail deterministically on an unloaded machine, because the failure needs a slow machine and rule 26 forbids asserting wall time; not probed, stated honestly. (2) 3 consecutive runs on both versions: done, see above.

Release lines: none (test-only change).

**Review passed (sp12-rev-gcp-124)**

- Diff (`test/integration/preview.test.ts`, 3 lines) matches SP11 audit item 11's fix: `async function` with `this.timeout(60_000)`, and speed 2000 (the top of `SPEEDS`, `src/presentation/webview/timeline.ts:9`; `setSpeed` accepts any x > 0, `timeline.ts:28`, so 2000 takes effect) before the final play. Every wait still polls state; the only sleep is the existing 500 ms "stands still" check. No wall-time asserts (rule 26). Test-only, presentation tests layer; no cross-module imports added.
- Ran in `gcode-preview`: `pnpm install` ok, `pnpm lint` 0, `pnpm build` 0, `pnpm test` 122 tests, 121 pass, 1 fail: "no update for the stale time stops the follow..." in `test/follow.test.ts`, which is another card's uncommitted follow work (GCP-56), not this card's. A first lint/build run also failed at `test/follow.test.ts:464` while that file was being edited; a rerun passed. `node scripts/run.mjs checks`: exit 0 (84/84).
- `pnpm test:integration` 3 runs in a row, each on 1.100.0 and stable: 15 passing every time; the timeline test took 2.7 s (1.100.0) and 1.7 to 1.8 s (stable).
- Probe, criterion 1 (the timeout is honoured under load): with `await sleep(25_000)` added at the start of the test to stand in for a slow machine, the test passed on stable in 26.9 s with `this.timeout(60_000)`, and failed with "Timeout of 20000ms exceeded" once that line was removed. The file was restored afterwards (checked with diff) and dist-test rebundled. The speed-2000 change cuts real play time, but no test can show that without a wall-time assert; it is accepted as a margin and not probed.
- Probe, criterion 2: the 3 runs above.
- Note: the original red run is still not reproduced here (macOS, unloaded), so the "load" diagnosis is inferred, not proven. If CI still goes red, look at webview animation throttling next (the audit called that a guess).
