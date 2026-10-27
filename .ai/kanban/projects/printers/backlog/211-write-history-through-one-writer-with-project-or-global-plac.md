---
id: 211
title: Write history through one writer with project or global placement
type: feature
priority: P1
effort: M
model: sonnet
area: [daemon, history]
story: US54
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [209, 210, 186]
created: 2026-10-25
---

The only writer: serialises appends from all windows and writes to the project's `.vsslicer/history/` or, with no project, to a global history in a configured storage directory.

**Code:** `vsslicer/modules/printer/agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Appends from two sessions never interleave (test with concurrent appenders)
- [ ] Placement test: file from a workspace project goes to the project, otherwise to the global directory
- [ ] Records appended on upload done, job start and job end

## Tasks

- [ ] Writer
- [ ] Placement
- [ ] Tests

## Progress

Not started.
