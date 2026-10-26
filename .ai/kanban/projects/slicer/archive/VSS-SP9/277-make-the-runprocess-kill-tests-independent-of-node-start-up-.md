---
id: 277
title: Make the runProcess kill tests independent of node start-up time
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M3"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 3 of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The "SIGTERM-ignoring child gets SIGKILL" and "grandchildren in the group are killed" tests (`slicer-runtime/test/run-process.test.ts:L46-L63`) use a child that installs its traps before printing a ready line, e.g. `/bin/sh -c 'trap "" TERM; echo up; while :; do sleep 1; done'` and `sh -c 'sleep 1000 & echo $!; wait'`, and the timeout fires only after that line is seen (or the test waits for it), so node start-up time cannot change the outcome
- [x] The tests assert `r.lines[0]` exists before reading a pid; still skipped on Windows
- [x] No wall-time assertion; any timeout is a hang guard of at least 30 s (rule 26)

## Progress

Changed `vsslicer/modules/slicer-runtime/test/run-process.test.ts`: added an `sh` helper (`/bin/sh -c`); the SIGKILL test now runs `trap "" TERM; echo up; while :; do sleep 1; done` and asserts `lines[0]` is `up`; the grandchildren test runs `sleep 1000 & echo $!; wait`, asserts `lines[0]` exists and the pid is an integer, then that the pid is gone. Both stay skipped on Windows, use a 60 s hang guard, and assert no wall time. sh starts in milliseconds and installs its trap before the ready line, so with a 1000 ms timeout node start-up no longer matters. runProcess has no abort option, so the timeout is not literally gated on the ready line; I did not add one.
Verified: `pnpm test` 31 passed (run-process 28), `pnpm lint` clean, `node scripts/run.mjs checks` clean.

**Review passed (sp9-rev-slc-277)**: read the diff and `src/adapters/run-process.ts` (timer, group kill, close-time SIGKILL). Ran in `slicer-runtime`: `pnpm test` 31/31, `pnpm lint` clean, `pnpm build` clean; `node scripts/run.mjs checks` exit 0. Under load (8 parallel `node -e 'for(;;){}'` on an 8-core machine, killed after) ran the two kill tests 10 times: 10/10 pass (2 run, 26 skipped each time). Mutations in a `mktemp -d` copy: signalling only the direct child (no `-pid`, no close-time group SIGKILL) makes "grandchildren in the group are killed" fail; dropping the SIGKILL escalation makes "SIGTERM-ignoring child gets SIGKILL" fail (both via the 60 s hang guard). No wall-time assertion. On the ungated timeout: the only remaining race is `/bin/sh` exec plus one `trap` builtin against a 1000 ms timer, a few ms against 1 s, and `expect(lines[0]?.text).toBe('up')` makes any such failure name its cause; acceptable without an abort/ready gate in `runProcess`. Pre-existing, not new: a killed `sleep` could in theory still be an unreaped zombie when `kill(pid, 0)` runs; not seen in 11 runs.
