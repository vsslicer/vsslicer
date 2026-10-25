---
id: US9
title: "Trust that every dialect round-trips and reads the same shape"
status: reviewed
epic: VSS:E8
---

As a maintainer, I want one fixture corpus and CI checks that open and save each dialect untouched and read it into the shared `Project` shape, so that regressions in any reader are caught before release.

## Acceptance criteria

- [ ] Open then save is byte-identical for every part, relationship and content type on fixtures from Bambu Studio, OrcaSlicer, PrusaSlicer 2.9 and Cura
- [ ] Bambu, Orca, Prusa 2.x and Cura fixtures all produce one `Project` structure (plates, objects, parts, instances, per-object config, raw project config)
- [ ] No fixture is over the size cap; large inputs are generated in CI
- [ ] Verified only on fixtures (D5)

## Out of scope

- Anything outside this story's epic
