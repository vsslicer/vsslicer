---
id: US44
title: "Mirror objects, set instance counts and convert units"
status: reviewed
epic: VSS:E33
---

As a user, I want to mirror an object on X, Y or Z, add or remove instances and convert inches or metres to millimetres, so that models from other sources fit my plate.

## Acceptance criteria

- [ ] Mirror X, Y and Z, instance add, remove and set-count, and unit conversion (inch, metre) each round-trip through save, and the Orca CLI slices the result with the expected object and instance counts
- [ ] A mirrored object keeps outward-facing normals after save (winding corrected)
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- Arbitrary unit systems beyond inch and metre
