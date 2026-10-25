---
id: 48
title: Draw into a foreign three.js WebGL2 context with state save and restore
type: feature
priority: P1
effort: L
model: opus
area: [webview-kit]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP4"
depends_on: [44, 43]
created: 2026-10-25
---

VWR draws the G-code ribbon inside three.js. The renderer takes an existing context, saves and restores the GL state it touches.

## Acceptance criteria

- [ ] Snapshot of a three.js mesh plus segments matches
- [ ] three.js renders correctly after the kit draws (state-leak test comparing GL state before and after)
- [ ] three.js is a dev dependency of tests only, not of the kit

## Tasks

- [ ] Define the state set to save
- [ ] Implement foreign mode
- [ ] Write the snapshot and leak tests

## Progress

Not started.
