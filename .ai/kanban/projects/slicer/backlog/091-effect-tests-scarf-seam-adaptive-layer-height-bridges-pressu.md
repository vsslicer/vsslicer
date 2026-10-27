---
id: 91
title: "Effect tests: scarf seam, adaptive layer height, bridges, pressure equalizer"
type: feature
priority: P1
effort: M
model: sonnet
area: [engine]
story: US31
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [87]
created: 2026-10-25
---

Scarf or sloped seam (Z varies along the seam segment), adaptive layer height (non-uniform layer heights on the curved fixture), bridge detection over sparse infill (bridge role), and the mapped pressure equalizer, monotonic infill and ramping travel keys.

**Code:** `vsslicer/modules/common/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] Each effect is asserted on the fixture; engines with `unsupported` entries are skipped with the entry asserted
- [ ] Adaptive layer height: if an engine cannot do it from the CLI the test asserts the `unsupported` entry and the reason
- [ ] Mapped pressure-equalizer, monotonic infill and ramping-travel keys have an effect test where both off and on are observable in G-code, else the entry says why not

## Tasks

- [ ] Seam fixture
- [ ] Layer-height fixture
- [ ] Bridge fixture
- [ ] Assertions

## Progress

Not started.
