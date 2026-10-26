---
id: 200
title: Order modules when a devDependency closes a cycle in run.mjs
type: chore
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
created: 2026-10-26
---

From PRF-192's review (SP9, Left item 2): `profile-catalogue-data` has a devDependency on the published `@vsslicer/profile-api` (its generator's types), and PRF-193 makes profile-api depend on `profile-catalogue-data`. `vsslicer/scripts/lib.mjs` orders modules by dependencies and devDependencies and throws on a cycle.

**Code:** `vsslicer/scripts/lib.mjs`, `vsslicer/scripts/test/` (scripts, runner)

## Acceptance criteria

- [x] The build order drops a devDependency edge that would close a cycle (a devDependency resolves from the registry and needs nothing built first) and prints one note naming the dropped edge; a cycle through runtime dependencies still throws
- [x] Runner tests (`cd vsslicer/scripts && node --test test/`): a dev-edge cycle orders without throwing and prints the note; a runtime cycle still throws; mutation-probed
- [x] **Bounds:** ordering stays linear in modules plus edges (no per-edge re-sort); a test with 200 modules in one dev cycle counts visits

## Progress

Implemented in `vsslicer/scripts/lib.mjs` `order(modules, note)`: Tarjan SCCs, then dev-only edges (`devDeps`, set in run.mjs) inside an SCC are dropped with one note; a runtime cycle still throws. Linear; 200-module dev-cycle test counts `deps` reads (<= 4n).
Mutation probes: removing the devDeps check -> 3 tests fail; making every edge droppable (SCC check removed) -> 1 test fail (dev edge outside a cycle kept, no note).
Verified: runner tests 119 pass 0 fail; `run.mjs checks` exit 0.

**Review failed (sp10-rev-plt-200)**

Ran: `cd vsslicer/scripts && node --test test/` 119 pass 0 fail; `cd vsslicer && node scripts/run.mjs checks` exit 0. Mutation probes (temp copy): devDeps check removed -> 3 fail; SCC check removed -> 1 fail. Both confirmed.
Dry run on the real 40 modules, scratch copy with profile-api depending on profile-catalogue-data: one edge dropped (`profile-catalogue-data -> profile-api`), catalogue-data ordered at 24 and profile-api at 25, no runtime edge out of order. A runtime cycle (dev edge made runtime) still throws. `changed()` still follows runtime and dev edges (`m.deps` is unchanged): a change in either module selects the other. `withDeps` terminates on the cycle.

Problems:
1. `vsslicer/scripts/lib.mjs:9` (`note = console.log`) with `run.mjs:160`: the note goes to **stdout**, ahead of the JSON that `--list` prints. Probe: scratch copy with the simulated cycle, `node scripts/run.mjs build --list` prints `note: ordering ignores ...` then `[...]`. `.github/workflows/ci.yml:43-48` captures that stdout and runs `JSON.parse` on it, so the select job breaks as soon as PRF-193 lands. Rule: diagnostics go to stderr; stdout carries only the machine-readable output. Fix: default `note` to `console.error`, and add a runner test that `--list` stdout stays parseable JSON when a dev edge is dropped.
2. `vsslicer/scripts/run.mjs:185`: `ci` calls `order(modules)` a second time, so a `ci` run prints the note twice. The card asks for one note. Fix: reuse the order computed at line 160.

Non-blocking:
- Both `strong` (Tarjan) and `visit` are recursive. Probe: a 10,000-deep chain throws `RangeError: Maximum call stack size exceeded`, while 5,000 passes. That is fine for about 40 modules.
- `visit` still checks the stack with `stack.indexOf` (O(depth) per call), so a long chain is quadratic. The doc comment's "Linear" covers the Tarjan part only. An on-stack `Set` would make the whole thing linear.
- For PRF-193: a dev edge orders only if its dependency's published version already exists. On a clean Verdaccio (CI), profile-catalogue-data's install needs `@vsslicer/profile-api` before profile-api is published, so a bootstrap version has to exist first.

**Fix (sp10-plt-200-fix)**

1. `note` defaults to `console.error` (stderr). New `test/run-list.test.mjs` runs a scratch copy of run.mjs over two modules with a dev cycle: `build --list` stdout parses as `["@vsslicer/b","@vsslicer/a"]`, stderr holds the note.
2. `run.mjs` keeps the order from the first `order()` call (`fullOrder`) for `ci`, so the note prints once.
3. `order` is now iterative (Tarjan and DFS, explicit work stacks) with an `onPath` Set instead of `stack.indexOf`; edges and kept-edges are cached per module. New tests: 10,000-deep chain orders; 10,000-module runtime cycle throws the cycle error.
Mutation probes: note back to `console.log` -> run-list test fails; cycle check disabled (`if (false)`) -> the lib test file fails (runtime-cycle tests).
Verified: runner tests 122 pass 0 fail; `run.mjs checks` exit 0.

**Review failed (sp10-rerev-plt-200)**

Ran: `cd vsslicer/scripts && node --test test/` 122 pass 0 fail; `cd vsslicer && node scripts/run.mjs checks` exit 0. Real modules: `build --list` from the working tree and from HEAD's `run.mjs`/`lib.mjs`/`versioning.mjs` (scratch copy, same `modules/`) are byte-identical, 40 modules, no note on stderr.
Earlier points fixed: (1) note defaults to `console.error`; `test/run-list.test.mjs` parses `--list` stdout as JSON and finds the note on stderr; probe note back to `console.log` -> 1 fail. (2) `ci` reuses `fullOrder` (`run.mjs:160,185`): `order()` runs once, so one note. Iterative Tarjan + DFS: HEAD's recursive `order` swapped in -> 5 fail (both 10,000 tests among them). Drop-all-dev-edges probe (SCC check -> `true`) -> 1 fail.

Problems:
1. `vsslicer/scripts/test/lib.test.mjs:91-102` (the "200 modules ... linear in visits" test) cannot fail on the bound it names. Each fixture module has one edge, so per-edge work equals per-module work. Probe: edge cache removed in `lib.mjs` (`if (!edgeCache.has(n))` -> `if (true)`, so deps are re-read and re-sorted on every edge step): the test passes with 600 reads against a limit of 800. With 20 edges per module the same mutation reads 4,400 times, while the real code reads 200. Rule: a bound test must use a fixture where the slow version does measurably more work than the limit allows. Fix: give each of the 200 modules several dev edges inside the cycle (e.g. the next 10 modules) and assert `visits <= n` (the code reads `deps` once per module). Re-probe with the cache removed.

Non-blocking:
- The on-path check is O(1) (`onPath` Set), but no test guards it: swapping in a linear `path.some(...)` still passes, because a 10,000-deep chain is only about 5*10^7 steps. Acceptable for an S card; say so in the test comment or leave it.
- `lib.mjs`, `run.mjs` and `test/lib.test.mjs` were reformatted wholesale (single to double quotes, prettier wrapping; the repo has no prettier config and HEAD uses single quotes). The real change to `run.mjs` is 6 lines (`devDeps`, `fullOrder`), but the diff is about 300. Coordinator: consider restoring the original formatting before the commit, so the PLT-200 commit shows only its change.

**Fix 2 (sp10-plt-200-fix2)**

1. Bound test now `a dev cycle of 200 modules reads each module once`: each module has 10 dev edges in the cycle, asserts `visits <= n` (was `4n` with one edge). Probe: edge cache disabled (`if (true)`) -> test fails with `visits 2400`; restored.
2. Formatting restored: `run.mjs` is HEAD plus the 4 real lines (`devDeps`, `fullOrder`); `lib.mjs` keeps HEAD's `changed`/`localDeps` untouched (only `order` changed); `test/lib.test.mjs` is HEAD plus the new tests (diff has 0 removed lines). Diff now: lib.mjs +87/-14, run.mjs +4/-4, lib.test.mjs +52/-0.
3. The on-path `Set` has no dedicated test (10,000-deep chain is too small to separate it); left as is, non-blocking.
Verified: runner tests 122 pass 0 fail; `run.mjs checks` exit 0.

**Review passed (sp10-coordinator, re-review of fix round 2)**: runner tests 122 pass, 0 fail; probe: edge cache disabled (`if (true)`) fails the 200-module bound test (121/1), restored; diff now lib.mjs +87/-14, run.mjs +4/-4, lib.test.mjs +52/-0 (HEAD formatting kept). The second review's other checks (stderr note with JSON `--list` test, single note under ci, iterative Tarjan, unchanged real order) stand. Non-blocking left: no dedicated test for the on-path Set.
