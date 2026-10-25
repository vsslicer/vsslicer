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

Puts the AGPL-3.0 text at the root and `"license": "AGPL-3.0-or-later"` in every package, and starts `CONTRIBUTING.md` and the `.ai/instructions.md` "Build and test" section with the decisions this epic makes (pnpm + Turborepo and the rejected alternatives, layout, Node pin, DCO per D10).

## Acceptance criteria

- [ ] `LICENSE` is the unmodified AGPL-3.0 text
- [ ] Every `package.json` carries the licence expression
- [ ] `CONTRIBUTING.md` explains setup, layout, DCO sign-off, the Changesets rule and the monorepo decision with rejected alternatives
- [ ] `.ai/instructions.md` "Build and test" lists the real commands

## Tasks

- [ ] Add LICENSE and fields
- [ ] Write `CONTRIBUTING.md`
- [ ] Update `.ai/instructions.md` Build and test
- [ ] Add SPDX header to existing source files

## Progress

Not started.
