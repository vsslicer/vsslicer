---
id: 175
title: Test plate invariants under random commands
type: feature
priority: P1
effort: M
model: opus
area: [plates]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP20"
depends_on: [174, 103]
created: 2026-10-25
---

Extends the command generator with plate commands and checks the invariants after every step.

**Code:** `vsslicer/modules/project-extension/test/property/plates/` (module: `project-extension`, layer: n/a (tests))

## Acceptance criteria

- [ ] After any random sequence every instance is on exactly one plate and locked plates are unchanged except by unlock
- [ ] Delete then undo restores membership and order
- [ ] A command that breaks an invariant is caught (meta-test)

## Tasks

- [ ] Generators
- [ ] Invariant checks
- [ ] Meta-test

## Progress

Not started.
