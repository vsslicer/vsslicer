---
id: 100
title: "Define the Command interface, registry and serialisable command log"
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP18"
depends_on: [52]
created: 2026-10-25
---

The contract every edit follows: a `Command` with `apply`, `invert`, a type id, a version and a serialisable payload, a registry of command types, and the grouping of commands into one undo step. Cura's approach, `projects-and-fleet.md` section 5.

**Code:** `vsslicer/modules/project-extension/src/application/commands/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A command round-trips through serialise and deserialise through the registry; an unknown type gives a typed error
- [ ] Groups of commands form one step and invert in reverse order
- [ ] No VS Code import (runs in plain Node)

## Tasks

- [ ] Interface and registry
- [ ] Step grouping
- [ ] Tests

## Progress

Not started.
