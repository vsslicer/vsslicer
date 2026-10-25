---
id: 22
title: Unit-test each Klipper planner rule
type: chore
priority: P0
effort: M
model: sonnet
area: [planner]
story: US7
milestone: "VSS:M1"
depends_on: [20]
created: 2026-10-25
---

Each rule has a test that names the regression it catches.

## Acceptance criteria

- [ ] Junction at 90 and 180 degrees
- [ ] Minimum cruise ratio on a zig-zag
- [ ] Lookahead flush on a long straight
- [ ] Arc segmentation count
- [ ] Klipper ignores M201/M203/M205

## Tasks

- [ ] Write each test with a comment naming its regression
- [ ] Verify each fails when the rule is broken

## Progress

Not started.
