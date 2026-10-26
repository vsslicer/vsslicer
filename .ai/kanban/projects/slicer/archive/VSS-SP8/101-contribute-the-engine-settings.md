---
id: 101
title: Contribute the engine settings
type: feature
priority: P0
effort: S
model: sonnet
area: [engine, tasks]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [100]
created: 2026-10-25
---

Settings `vsslicer.slicer.engine`, `.orca.path`, `.cura.path`, `.timeout`, and the output folder default `.vsslicer/sliced`.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [x] Settings appear with descriptions, defaults and machine/window scope as appropriate
- [x] A test reads each setting through a thin config adapter
- [x] Invalid values (negative timeout) are reported once

## Tasks

- [x] package.json contributions
- [x] Config adapter
- [x] Tests

## Progress

Not started.

Review (sp8-reviewer-20, 08:16): PASS
Checked: package.json contributes.configuration has all five settings with type, default, description; orca.path and cura.path scope machine, others window; engine enum, timeout minimum 1 default 600, outputFolder default .vsslicer/sliced. config.ts takes a getter (no vscode import), invalid engine/timeout/path types fall back to defaults and warn once per distinct problem. Ran slicer-extension pnpm test (5 pass), lint, build, test:integration (2 pass, defaults read through real VS Code). Note (non-blocking): outputFolder accepts absolute or ".." paths despite "relative to the workspace"; validate when the slice command consumes it.
