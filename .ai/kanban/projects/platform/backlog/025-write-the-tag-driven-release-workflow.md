---
id: 25
title: Write the tag-driven release workflow
type: feature
priority: P0
effort: L
model: opus
area: [publishing]
story: US6
milestone: "VSS:M1"
sprint: "VSS:SP8"
depends_on: [20, 23, 16, 24]
created: 2026-10-25
---

A tag `<name>@x.y.z` releases that one module: build, package and publish it alone. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] On a test tag the workflow produces a GitHub release holding the VSIX and source tarball
- [ ] Version-to-pre-release mapping covered by a unit test
- [ ] Permissions are minimal and per job; secrets only reach the publish job
- [ ] Workflow is idempotent up to the publish steps

## Tasks

- [ ] Write the workflow and tag parsing
- [ ] Add release assets and notes from the changelog
- [ ] Write the rollback notes in `CONTRIBUTING.md`

## Progress

Not started.
