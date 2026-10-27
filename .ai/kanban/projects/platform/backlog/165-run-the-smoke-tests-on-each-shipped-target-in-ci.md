---
id: 165
title: Run the smoke tests on each shipped target in CI
type: chore
priority: P0
effort: S
model: sonnet
area: [ci]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP17"
depends_on: [161, 163, 153]
created: 2026-10-25
---

Matrix job: the smoke tests on every target for which an artefact exists (Linux first; unsigned macOS and Windows artefacts are tested but not released).

**Code:** `.github/workflows/build.yml` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Each target runs install, start, extensions active, fixtures and slice; failures name target and step
- [ ] The set of shipped targets is one list in the workflow
- [ ] Runs on GitHub-hosted runners only

## Tasks

- [ ] Add the matrix
- [ ] Add the shipped-target list

## Progress

Not started.
