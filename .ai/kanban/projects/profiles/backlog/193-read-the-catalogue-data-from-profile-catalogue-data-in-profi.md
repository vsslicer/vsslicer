---
id: 193
title: Read the catalogue data from profile-catalogue-data in profile-api
type: feature
priority: P1
effort: M
model: opus
milestone: "VSS:M2"
sprint: "VSS:SP17"
depends_on: [192, PLT-200]
created: 2026-10-26
---

Split from PRF-192 (Q20, separate data package). After `profile-catalogue-data@0.1.0` is published, profile-api drops its AGPL-3.0-only catalogue data and reads it through a semver dependency.

**Code:** `vsslicer/modules/common/profile-api` (`src/domain/catalogue/`, `tools/catalogue/`, package) (module: `profile-api`, layer: domain and package)

## Acceptance criteria

- [ ] profile-api has no AGPL-3.0-only data left in `src/` or `dist/`, keeps `AGPL-3.0-or-later`, and depends on `@vsslicer/profile-catalogue-data` by a semver range; its catalogue tests pass against the published data
- [ ] PROVENANCE.md leaves profile-api (it lives with the data); the README states the split; PRF-179 closes with this card
- [ ] Dependants of profile-api re-locked once (rule 13)

## Progress

Not started.

**Coordinator (SP10), from PLT-200's review:** PLT-200 lets the runner order a devDependency cycle, but on a clean registry (CI) `profile-catalogue-data` cannot install before `profile-api` is published, and profile-api will need catalogue-data published first. Before switching profile-api over, break the cycle at install time: e.g. move the generator (`tools/catalogue/`, the only user of the devDependency) out of the published package's install graph (its own private module that depends on both), or bootstrap by publishing catalogue-data without the devDependency. Decide and record it in this card's criteria before building.
