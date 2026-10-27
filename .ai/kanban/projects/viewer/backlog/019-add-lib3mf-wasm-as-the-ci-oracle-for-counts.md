---
id: 19
title: Add lib3mf WASM as the CI oracle for counts
type: chore
priority: P0
effort: M
model: opus
area: [3mf]
story: US3
milestone: "VSS:M7"
depends_on: [17, PLT-9]
created: 2026-10-25
---

PLT's monorepo cards do not provide lib3mf, so this card adds it as a dev-only dependency that compares object, triangle and build-item counts on every fixture. lib3mf is never shipped.

**Code:** `vsslicer/modules/core/3mf/test/oracle/` (module: `3mf`, layer: n/a (ci))

## Acceptance criteria

- [ ] Object, triangle and build-item counts from lib3mf WASM equal ours on the Consortium positives and every dialect fixture
- [ ] lib3mf is a devDependency only and the bundled-dependency licence check passes
- [ ] A mutated reader fails the comparison (meta-test)

## Tasks

- [ ] Load lib3mf WASM in Node
- [ ] Write the comparison
- [ ] Meta-test

## Progress

Not started.

**Moved to M7 (Owner setup) at SP9 (sp9-coordinator):** owner answers Q7 and Q13 ("Move them to a later milestone until I set up the remote/accounts"); Q8 (no marketplace accounts). This card needs the GitHub remote, CI on it or marketplace accounts, so it leaves the sprints until the owner sets them up.
