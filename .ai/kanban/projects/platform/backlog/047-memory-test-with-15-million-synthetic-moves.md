---
id: 47
title: Memory test with 15 million synthetic moves
type: feature
priority: P1
effort: M
model: sonnet
area: [webview-kit]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP4"
depends_on: [44]
created: 2026-10-25
---

The 500 MB budget case: GPU-side bytes per move must stay at or under the stated layout.

## Acceptance criteria

- [ ] 15 million moves render in headless Chromium; the test prints GPU bytes per move and fails above the layout's figure
- [ ] Result noted with machine, GPU and Chromium version

## Tasks

- [ ] Generate moves in chunks
- [ ] Measure texture bytes
- [ ] Assert and print

## Progress

Not started.
