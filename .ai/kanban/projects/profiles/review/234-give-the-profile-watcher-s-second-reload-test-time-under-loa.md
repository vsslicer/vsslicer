---
id: 234
title: "Give the profile watcher's second-reload test time under load"
type: bug
priority: P1
effort: XS
model: sonnet
sprint: "VSS:SP14"
created: 2026-10-28
---

`vsslicer/modules/profiles/profiles/test/adapters/watch.test.ts` "an event during a running reload triggers a second reload with the new content" failed once under a full local `node scripts/run.mjs ci` (2026-10-28: `expected 1 to be 2` at line 119) and passes 5 of 5 alone. `vi.waitFor` uses its default 1 s real-time budget while the two reloads read real files.

Module: `profiles`, layer: test. Done when the wait has a budget that holds under full-CI load (5 s), the test still fails if the second reload never happens (probe recorded), and it passes in a full CI run.
## Progress

- 2026-10-28 (PRF-234-investigator): the 5 s timeout (e0e12ed2) did not fix it; CI run 40669283264 failed on ubuntu and macos. **Root cause, a test bug:** the `counting()` adapter read `state.gate` only *after* the real `fsStore.read()` resolved. The test clears the gate straight after the first `advanceTimersByTimeAsync`, and fake timers don't wait for real I/O, so the "held" first reload was never held. It could finish during the real `put(v2)`, before `onDidChange` was attached, and the second fire then started a fresh reload instead of joining the running one: `events` stuck at 1. The watcher is correct: an event during a running reload sets `dirty` and reloads again. The product is unchanged, so no bump or re-lock.
- Fix: `read()` takes `const gate = state.gate` before the real read, and the 5 s timeout is reverted to the default.
- Proof: a deterministic repro (20× `put(v2)` widens the window) failed 5/5 before the fix and passed 3/3 after. 300 repeats (`repeats: 299`): HEAD fails, fixed passes 300/300. Module lint clean, 123/123 tests; `node scripts/run.mjs ci --allow-unbumped` exit 0. `--allow-unbumped` was needed only because the other worker's slicer/runtime change is unbumped. Notes: `.reference/notes/PRF-234-watcher-race.md`.
