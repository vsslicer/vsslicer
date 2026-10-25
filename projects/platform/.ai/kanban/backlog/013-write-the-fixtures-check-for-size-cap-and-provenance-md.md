---
id: 13
title: Write the fixtures check for size cap and PROVENANCE.md
type: feature
priority: P1
effort: S
model: sonnet
area: [ci]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [9]
created: 2026-10-25
---

Keeps the repository small: no fixture over 5 MB, every `fixtures/` folder has `PROVENANCE.md` (generator, version, settings, licence). Large inputs (the 50, 200 and 500 MB G-code budget files) are generated in CI.

## Acceptance criteria

- [ ] A 6 MB file in a fixture folder fails the check
- [ ] A fixture folder without `PROVENANCE.md` fails
- [ ] `tools/generate-large-fixture` is a stub with a documented interface that GCP fills; CI caches its output
- [ ] The check runs in CI

## Tasks

- [ ] Implement `tools/check-fixtures`
- [ ] Add negative fixtures built at test time (not committed)
- [ ] Document the generator interface

## Progress

Not started.
