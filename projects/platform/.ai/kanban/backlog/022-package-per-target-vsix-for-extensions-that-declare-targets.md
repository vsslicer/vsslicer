---
id: 22
title: Package per-target VSIX for extensions that declare targets
type: feature
priority: P1
effort: S
model: sonnet
area: [publishing]
story: US5
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [21]
created: 2026-10-25
---

Module: `tooling` (package helper). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Later SLC and PRN extensions ship platform-specific VSIX; prove the mechanism now with a fixture.

## Acceptance criteria

- [ ] A fixture extension with `targets: [linux-x64, win32-x64]` yields two VSIX files, each passed the right `--target`
- [ ] The content assertion runs for each file

## Tasks

- [ ] Add the fixture
- [ ] Loop over targets in the package tool
- [ ] Test the file names and manifests

## Progress

Not started.
