---
id: US7
title: "Trust Orca slicing: CI on three systems and the H2C"
status: reviewed
epic: VSS:E26
---

As a maintainer, I want fixture plates sliced through the pinned Orca in CI and once on the owner's H2C profile, so that engine drift shows as a pinned-version bump and the loop is proven on the one real printer.

## Acceptance criteria

- [ ] On Linux CI the pinned Orca slices the fixture plate set; `--pipe` progress reaches 100, `result.json` is read, and `@vsslicer/gcode` parses the output with the expected layer count and roles
- [ ] On macOS and Windows runners (free GitHub Actions) a slice completes with indeterminate progress
- [ ] Our time estimate is within the I5 tolerance of the engine's own estimate on the fixtures
- [ ] Headless Linux findings (AppImage without FUSE, `xvfb-run`) and the pinned release choice (H2C machine profile present, or the Bambu Studio CLI variant) are recorded
- [ ] On the owner's machine a fixture Bambu 3MF plate is sliced with the installed Orca for the H2C machine profile; Orca version and date recorded (D5); everything else on fixtures

## Out of scope

- Printing the result (US25)
