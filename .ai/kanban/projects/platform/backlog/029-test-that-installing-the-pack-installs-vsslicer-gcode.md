---
id: 29
title: Test that installing the pack installs vsslicer.gcode
type: feature
priority: P1
effort: S
model: sonnet
area: [publishing]
story: US6
milestone: "VSS:M1"
sprint: "VSS:SP8"
depends_on: [28]
created: 2026-10-25
---

Needs the first `vsslicer.gcode` build from E68 (GCP board); until then write the test against a stub extension. Manual check in clean VS Code and VSCodium recorded with versions, then an integration test against local VSIX files.

## Acceptance criteria

- [ ] Integration test installs the pack VSIX and a stub member VSIX into a clean profile and asserts the member is present
- [ ] The manual check is recorded with versions once `vsslicer.gcode` exists

## Tasks

- [ ] Write the test using the harness
- [ ] Swap the stub for the real build when E68 lands
- [ ] Record the manual check

## Progress

Not started.
