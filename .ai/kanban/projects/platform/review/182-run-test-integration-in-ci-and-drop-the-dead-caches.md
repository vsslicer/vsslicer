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

- [x] CI runs `test:integration` for extension modules (xvfb on Linux) using the shared VS Code cache
- [x] The large-fixtures cache step is removed or caches real output

## Tasks

- [x] Write the failing test
- [x] Fix
- [ ] Release a patch version of each changed module

## Progress

Added xvfb/non-Linux `run.mjs test:integration --changed` steps to ci.yml with VSCODE_TEST_CACHE, removed large-fixtures cache, test in scripts/test/ci-integration.test.mjs. Local example-extension test:integration passes on macOS. No module changed, so no release.
