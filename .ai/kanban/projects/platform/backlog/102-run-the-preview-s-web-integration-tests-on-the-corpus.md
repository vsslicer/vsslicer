---
id: 102
title: "Run the preview's web integration tests on the corpus"
type: chore
priority: P2
effort: M
model: sonnet
area: [web]
story: US53
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [100, 101, 83, 93]
created: 2026-10-25
---

`@vscode/test-web` tests that open a fixture from each slicer family and a `.bgcode`, a `.gcode.3mf`, scrub layers and read thumbnails, and time the open of a file under the limit.

**Code:** `vsslicer/modules/apps/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] The fixtures from the I1 corpus open and the layer count and thumbnails match their golden values in the web host
- [ ] A file under the limit opens within the stated time on the CI runner; over the limit shows the message
- [ ] The tests run in CI on a pull request that touches the browser path

## Tasks

- [ ] Fixtures
- [ ] Scenarios
- [ ] Timing assertion

## Progress

Not started.
