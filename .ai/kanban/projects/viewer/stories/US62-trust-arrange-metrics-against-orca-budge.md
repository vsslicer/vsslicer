---
id: US62
title: "Trust arrange: metrics against Orca, budgets and slicing"
status: reviewed
epic: VSS:E35
---

As a maintainer, I want arrange measured against Orca on recorded fixtures and checked by slicing, so that quality and speed do not regress.

## Acceptance criteria

- [ ] Fixture sets of 10, 50 and 200 mixed objects on rectangular, circular and excluded-area beds: no overlaps, every instance inside, bed utilisation within 5 percent of Orca's arrange (Orca GUI result recorded once per fixture)
- [ ] 200 objects arrange within a recorded budget in a worker without blocking the extension host
- [ ] The Orca CLI slices an arranged fixture with no object-outside-bed warning
- [ ] Verified only on fixtures (D5)

## Out of scope

- Arrange on printers other than the fixture beds
