---
id: 6
title: "Add LICENSE, package licence fields and the contributor docs skeleton"
type: docs
priority: P0
effort: S
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [2]
created: 2026-10-25
---

Puts the AGPL-3.0 text at the repository root (for GitHub's detection) and in every module, `"license": "AGPL-3.0-or-later"` in every module's `package.json`, and starts `CONTRIBUTING.md` and the `.ai/instructions.md` "Build and test" section with the decisions this epic makes (independent modules and the local registry, D12; layout; Node pin; DCO per D10). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] `LICENSE` at the repository root and in every module is the unmodified AGPL-3.0 text
- [ ] Every module's `package.json` carries the licence expression
- [ ] `CONTRIBUTING.md` explains setup, layout, DCO sign-off, the version-bump rule and the independent-module decision with rejected alternatives (workspace, Turborepo, `link:` dependencies)
- [ ] `.ai/instructions.md` "Build and test" lists the real commands

## Tasks

- [ ] Add LICENSE and fields
- [ ] Write `CONTRIBUTING.md`
- [ ] Update `.ai/instructions.md` Build and test
- [ ] Add SPDX header to existing source files

## Progress

Not started.
