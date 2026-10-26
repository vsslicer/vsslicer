---
id: 193
title: Read the catalogue data from profile-catalogue-data in profile-api
type: feature
priority: P1
effort: M
model: opus
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [192]
created: 2026-10-26
---

Split from PRF-192 (Q20, separate data package). After `profile-catalogue-data@0.1.0` is published, profile-api drops its AGPL-3.0-only catalogue data and reads it through a semver dependency.

**Code:** `vsslicer/modules/profile-api` (`src/domain/catalogue/`, `tools/catalogue/`, package) (module: `profile-api`, layer: domain and package)

## Acceptance criteria

- [ ] profile-api has no AGPL-3.0-only data left in `src/` or `dist/`, keeps `AGPL-3.0-or-later`, and depends on `@vsslicer/profile-catalogue-data` by a semver range; its catalogue tests pass against the published data
- [ ] PROVENANCE.md leaves profile-api (it lives with the data); the README states the split; PRF-179 closes with this card
- [ ] Dependants of profile-api re-locked once (rule 13)

## Progress

Not started.
