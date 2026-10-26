---
id: 6
title: Implement merge(chain) and chain resolution with typed errors
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US2
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [2]
created: 2026-10-25
---

The inheritance rule every resolved profile depends on: left-to-right parents, child last, maps deep-merged, arrays replaced, `null` falls through.

**Code:** `vsslicer/modules/profile-api/src/domain/inheritance/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] Tests: last parent wins; own `settings` win over parents; maps deep-merged; arrays replaced; `null` falls through to the parent value
- [x] A cycle raises `InheritanceCycleError` naming the loop; an unknown parent raises `UnknownParentError` naming child and parent; neither is swallowed
- [x] `abstract` entities merge but are flagged non-selectable in the result
- [x] A property-based test shows `merge` is associative for chains of up to 5 entities

## Tasks

- [x] Write merge
- [x] Write chain resolution against a lookup function
- [x] Add typed errors and the tests

## Progress

Done. `src/domain/inheritance/`: `merge(chain)` (last non-null wins, maps deep-merged, arrays/scalars replaced, null falls through; `__proto__` keys stay data), `resolve(entity, lookup)` (depth-first, parents left to right then the entity; returns `{entity, selectable}`; `abstract`, `renamed_from`, `meta`, `id`, `inherits` are the entity's own, not inherited), `InheritanceCycleError` (`.cycle`, e.g. y -> z -> y) and `UnknownParentError` (`.child`, `.parent`); neither is caught. Exported from `src/index.ts`.
Verified: `test/inheritance.test.ts` covers every criterion, plus diamond ancestry (not a cycle) and a fast-check property test (500 runs, chains of 1-5) that splitting a chain anywhere and merging the halves equals merging the whole. `pnpm lint && pnpm build && pnpm test` pass.
Caveat for the reviewer: merge is associative only while a key keeps one kind (scalar/array/map) across the chain; a scalar between two maps resets the merge ({p:1} + 7 + {q:2} is {q:2}, but {p:1} + ({q:2} replacing 7) is {p:1,q:2} when grouped right). The property test generates kind-consistent keys; this is documented on `merge`.
Dependency added: devDependency `fast-check` (lockfile touched).
Files: src/domain/inheritance/*.ts, src/index.ts, test/inheritance.test.ts, package.json, pnpm-lock.yaml.
Changelog: PRF-6: `merge(chain)`, `resolve(entity, lookup)`, `InheritanceCycleError`, `UnknownParentError`.

Review passed (prf36-reviewer): lint, build, test green. Probed: self-cycle (a -> a), two-node cycle (b -> c -> b) raise InheritanceCycleError with the loop; unknown parent raises UnknownParentError naming child and parent; abstract parent merges and child stays selectable, abstract itself selectable=false; maps deep-merged, null falls through (also inside nested maps). Scalar-between-maps reset ({p:1}+7+{q:2}={q:2}) matches research "last non-null wins, maps deep-merged, arrays replaced"; it is documented on merge and the associativity property is kind-consistent only, which is the only sound reading. devDependencies ajv and fast-check are only used by tests.
