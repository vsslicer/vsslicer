---
id: US17
title: "Trust CuraEngine output on three systems"
status: reviewed
epic: VSS:E28
---

As a maintainer, I want fixture models sliced with the pinned CuraEngine on every platform and every setting the engine reads proven present, so that a profile never reaches the engine incomplete.

## Acceptance criteria

- [ ] Every setting key the engine reads is present in the resolved input; a test runs the pinned CuraEngine on each fixture tuple and fails on any 'missing setting' log line or exit 2
- [ ] Fixture models slice in CI on Linux, macOS and Windows; `@vsslicer/gcode` parses the output with the expected layer count and roles; our estimate is within the I5 tolerance of the `;TIME:` header
- [ ] Thumbnails and labels on the plain G-code are injected by `slicer-output` after the slice

## Out of scope

- Hardware verification (D5)
