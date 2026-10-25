---
id: 180
title: Add a prepack build to every module that ships dist
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP3"
docs: [.ai/audits/SP2-audit.md]
created: 2026-10-25
---

Module: example, example-extension, gcode-api, gcode-bgcode, test-vscode, test-webview. Finding 3 of the SP2 audit, `.ai/audits/SP2-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] Every module with built output has `prepack` running its build
- [ ] A check in `run.mjs checks` fails for a module whose `files` ship `dist` without `prepack` (test first)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] Release a patch version of each changed module

## Progress

Not started.
