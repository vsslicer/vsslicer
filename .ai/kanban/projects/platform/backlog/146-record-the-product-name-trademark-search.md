---
id: 146
title: Record the product name trademark search
type: docs
priority: P1
effort: XS
model: sonnet
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [127]
created: 2026-10-25
---

The owner runs the trademark search for the product name (roadmap question 4) before the first public build; this card records the outcome and gates the first release job.

**Code:** `vsslicer/modules/vsslicer-build/docs/trademark.md` (module: `vsslicer-build`, layer: n/a (owner record))

## Acceptance criteria

- [ ] `docs/trademark.md` has the date, the databases searched, the outcome and the chosen name (default: VSSlicer)
- [ ] The release job (PLT-167) refuses to publish when the file lacks an outcome line (test)

## Tasks

- [ ] Ask the owner on the board
- [ ] Write the record

## Progress

Not started.
