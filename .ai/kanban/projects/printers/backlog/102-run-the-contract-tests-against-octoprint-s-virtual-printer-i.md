---
id: 102
title: "Run the contract tests against OctoPrint's virtual printer in CI"
type: chore
priority: P0
effort: M
model: sonnet
area: [octoprint]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [101, 94]
created: 2026-10-25
---

A CI job that starts OctoPrint's virtual printer in Docker and runs upload, start, pause and cancel with the adapter.

**Code:** `vsslicer/modules/printer-octoprint/` (module: `printer-octoprint`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] Job passes on Linux CI; if the spike said it is not feasible in free minutes, a recorded-fixture fallback and a note in the module replace it

## Tasks

- [ ] Compose file
- [ ] CI job
- [ ] Fallback note

## Progress

Not started.
