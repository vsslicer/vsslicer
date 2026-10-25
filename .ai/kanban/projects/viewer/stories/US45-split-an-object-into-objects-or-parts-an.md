---
id: US45
title: "Split an object into objects or parts and merge objects"
status: reviewed
epic: VSS:E33
---

As a user, I want to split a multi-shell model into separate objects or parts and to merge objects into one with parts, so that I can handle each piece on its own.

## Acceptance criteria

- [ ] Split of a two-shell mesh yields two objects (or two parts) with the original triangle sets; merge then split is identity on triangle sets
- [ ] Each operation round-trips through save and the Orca CLI slices the result with the expected object and part counts
- [ ] Split runs in a worker and does not block the host
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- Cut by plane and boolean operations (E53)
