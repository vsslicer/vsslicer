---
id: 116
title: "Spike: can pseudoterminal output feed problem matchers in supported VS Code versions"
type: spike
priority: P1
effort: S
model: opus
area: [tasks]
story: US18
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [115, PLT-15]
created: 2026-10-25
---

Decides whether `CustomExecution` pseudoterminal output reaches problem matchers on the minimum and current VS Code, else uses a `ShellExecution` wrapper around a small Node CLI.

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (spike))

## Acceptance criteria

- [ ] Test on `engines.vscode` minimum and stable: matcher fires or not, recorded
- [ ] Decision recorded with the fallback design if needed

## Tasks

- [ ] Sample task
- [ ] Run on both versions
- [ ] Record

## Progress

Not started.
