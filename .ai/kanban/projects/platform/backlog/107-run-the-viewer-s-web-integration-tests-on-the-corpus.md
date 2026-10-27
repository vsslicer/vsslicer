---
id: 107
title: "Run the viewer's web integration tests on the corpus"
type: chore
priority: P2
effort: M
model: sonnet
area: [web]
story: US54
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [105, 106, 83]
created: 2026-10-25
---

`@vscode/test-web` tests that open `.3mf` (each dialect fixture), `.stl` and `.obj` from the I2 corpus and check statistics, the tree and a rendered frame.

**Code:** `vsslicer/modules/apps/project/src/presentation/...` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Every fixture opens in the web host with the statistics the desktop tests expect; an over-limit file shows the message
- [ ] The tests run in CI on a pull request that touches the browser path

## Tasks

- [ ] Fixtures
- [ ] Scenarios

## Progress

Not started.
