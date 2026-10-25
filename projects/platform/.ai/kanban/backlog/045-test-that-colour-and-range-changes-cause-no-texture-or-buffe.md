---
id: 45
title: Test that colour and range changes cause no texture or buffer uploads
type: feature
priority: P0
effort: S
model: sonnet
area: [webview-kit]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [44]
created: 2026-10-25
---

Context spy test catching per-slider-step re-uploads, a regression a snapshot would miss.

## Acceptance criteria

- [ ] Switching colour mode and sweeping the range issues no `texImage2D`, `texSubImage2D` or `bufferData` call
- [ ] The spy is a reusable helper in the testing entry

## Tasks

- [ ] Write the spy proxy
- [ ] Write the test
- [ ] Export the helper

## Progress

Not started.
