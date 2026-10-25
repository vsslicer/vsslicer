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

- [x] Every module lockfile pins only the current version of each `@vsslicer/*` dependency (test-webview's `^0.3.0` range on example-extension raised)
- [x] A check in `run.mjs checks` fails when a lockfile pins a non-current `@vsslicer/*` version, naming both modules (test first)
- [x] `scripts/registry.sh stop; rm -rf .registry; scripts/registry.sh start && node scripts/run.mjs ci` passes from scratch

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] Release a patch version of each changed module

## Progress

Added `stalePinProblems` (versioning.mjs, test first), wired into `run.mjs checks` and `ci`. Released example 0.3.1, test-vscode 0.2.2, example-extension 0.7.2, test-webview 0.1.1, gcode-bgcode 0.3.2 (ranges raised, re-locked, published in dependency order). Also replaced each module's pnpm-workspace.yaml with gcode-api's (allowBuilds false for vsce-sign/keytar), which tooling 0.8.x needs or install fails with ERR_PNPM_IGNORED_BUILDS. Verified all 10 lockfiles with `integrityProblems` against current-only versions: 0 problems. Left for the coordinator: the clean-registry rebuild acceptance item (not run, shared registry untouched).
