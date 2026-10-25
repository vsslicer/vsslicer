---
id: 179
title: "Make a clean registry rebuild the repo: pin every lockfile to current @vsslicer versions"
type: bug
priority: P0
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP3"
docs: [.ai/audits/SP2-audit.md]
created: 2026-10-25
---

Module: scripts, example, example-extension, gcode-bgcode, test-vscode, test-webview. Finding 1 of the SP2 audit, `.ai/audits/SP2-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] Every module lockfile pins only the current version of each `@vsslicer/*` dependency (test-webview's `^0.3.0` range on example-extension raised)
- [ ] A check in `run.mjs checks` fails when a lockfile pins a non-current `@vsslicer/*` version, naming both modules (test first)
- [ ] `scripts/registry.sh stop; rm -rf .registry; scripts/registry.sh start && node scripts/run.mjs ci` passes from scratch

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] Release a patch version of each changed module

## Progress

Not started.
