---
id: 163
title: Slice the oracle fixtures with the Orca CLI and check the effects in the G-code
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [162, 144, 149, 150, SLC-30, GCP-4, GCP-5]
created: 2026-10-25
---

Slices each fixture through `slicer-orca` and uses the G-code parser to confirm the effect per object or layer range.

**Code:** `vsslicer/modules/project-extension/test/integration/oracle/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Negative volume: the cut shows in the layers; blocker: no support in its region; modifier: infill changed inside it; object override: that object's infill differs; range override: the change only inside the range
- [ ] A volume subtype the engine ignores fails the test with the subtype named
- [ ] Runs in CI on Linux; engine and parser versions printed

## Tasks

- [ ] Harness
- [ ] Per-fixture checks
- [ ] CI job

## Progress

Not started.
