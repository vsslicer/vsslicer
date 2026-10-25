---
id: 20
title: Set up Changesets and the release-tag convention
type: feature
priority: P0
effort: S
model: sonnet
area: [publishing]
story: US5
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [9]
created: 2026-10-25
---

A pull request carries a Changesets entry; merging to `main` updates a "Version packages" pull request; merging that bumps versions, writes each extension's `CHANGELOG.md` and pushes tags `<package>@<version>`.

## Acceptance criteria

- [ ] A pull request without an entry is flagged by a CI step (docs-only changes exempt)
- [ ] Version bump in the sample extension produces `CHANGELOG.md` and a `sample-extension@x.y.z` tag in a dry run
- [ ] Libraries are marked private (no npm publishing)

## Tasks

- [ ] Install and configure Changesets
- [ ] Add the CI check
- [ ] Add the version workflow
- [ ] Document the rule

## Progress

Not started.
