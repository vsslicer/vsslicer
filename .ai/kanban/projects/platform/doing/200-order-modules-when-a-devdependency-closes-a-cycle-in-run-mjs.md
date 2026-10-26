---
id: 200
title: Order modules when a devDependency closes a cycle in run.mjs
type: chore
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
created: 2026-10-26
---

From PRF-192's review (SP9, Left item 2): `profile-catalogue-data` has a devDependency on the published `@vsslicer/profile-api` (its generator's types), and PRF-193 makes profile-api depend on `profile-catalogue-data`. `vsslicer/scripts/lib.mjs` orders modules by dependencies and devDependencies and throws on a cycle.

**Code:** `vsslicer/scripts/lib.mjs`, `vsslicer/scripts/test/` (scripts, runner)

## Acceptance criteria

- [ ] The build order drops a devDependency edge that would close a cycle (a devDependency resolves from the registry and needs nothing built first) and prints one note naming the dropped edge; a cycle through runtime dependencies still throws
- [ ] Runner tests (`cd vsslicer/scripts && node --test test/`): a dev-edge cycle orders without throwing and prints the note; a runtime cycle still throws; mutation-probed
- [ ] **Bounds:** ordering stays linear in modules plus edges (no per-edge re-sort); a test with 200 modules in one dev cycle counts visits

## Progress

Not started.
