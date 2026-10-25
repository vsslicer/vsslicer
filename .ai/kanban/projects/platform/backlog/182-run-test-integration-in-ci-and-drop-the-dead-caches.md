---
id: 182
title: "Run test:integration in CI and drop the dead caches"
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP3"
docs: [.ai/audits/SP2-audit.md]
created: 2026-10-25
---

Module: .github, scripts. Finding 6 of the SP2 audit, `.ai/audits/SP2-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] CI runs `test:integration` for extension modules (xvfb on Linux) using the shared VS Code cache
- [ ] The large-fixtures cache step is removed or caches real output

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] Release a patch version of each changed module

## Progress

Not started.
