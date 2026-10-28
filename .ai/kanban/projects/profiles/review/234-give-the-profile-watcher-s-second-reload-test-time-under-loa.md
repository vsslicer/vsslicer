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