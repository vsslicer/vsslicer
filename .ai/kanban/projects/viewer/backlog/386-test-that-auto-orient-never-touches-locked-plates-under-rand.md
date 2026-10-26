---
id: 386
title: Test that auto-orient never touches locked plates under random commands
type: chore
priority: P2
effort: S
model: sonnet
area: [plates, editor]
story: US98
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [385]
created: 2026-10-25
---

Random sequences of lock, unlock, move-to-plate and auto-orient over a three-plate fixture, checking that no object on a locked plate changes.

**Code:** `vsslicer/modules/project-extension/test/property/orient/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] No transform on a locked plate changes in 1,000 random sequences
- [ ] A deliberately broken guard is caught (meta-test)

## Tasks

- [ ] Generator
- [ ] Property test
- [ ] Meta-test

## Progress

Not started.
