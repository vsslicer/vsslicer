---
id: 217
title: "Test overlaps, bounds and utilisation against Orca on the fixture sets"
type: feature
priority: P1
effort: M
model: opus
area: [arrange]
story: US62
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [215, 203]
created: 2026-10-25
---

Runs arrange on all nine fixtures and checks no polygon intersection, every instance inside the region and utilisation within 5 percent of Orca's recorded result.

**Code:** `vsslicer/modules/arrange/test/metrics/` (module: `arrange`, layer: n/a (tests))

## Acceptance criteria

- [ ] No overlaps and all inside on all nine fixtures
- [ ] Utilisation within 5 percent of the recorded Orca value, or the failing fixtures are listed in the report
- [ ] The report is printed in the CI log

## Tasks

- [ ] Metric functions
- [ ] Fixture runs
- [ ] Report

## Progress

Not started.
