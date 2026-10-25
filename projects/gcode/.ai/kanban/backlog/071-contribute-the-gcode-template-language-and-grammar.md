---
id: 71
title: Contribute the gcode-template language and grammar
type: feature
priority: P2
effort: M
model: sonnet
area: [language]
story: US42
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [43, 63]
created: 2026-10-25
---

Declares the `gcode-template` language and a TextMate grammar that includes the G-code grammar and highlights `[var]`, `{expr}`, conditions and indexed vectors; activation on the language id.

**Code:** `vsslicer/modules/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] Grammar snapshot tests (vscode-tmgrammar-test) over start, layer-change and tool-change templates from both slicers; a retokenisation fails
- [ ] Token boundaries agree with the library tokenizer on the fixtures (test)
- [ ] The existing `gcode` grammar snapshots are unchanged

## Tasks

- [ ] Language configuration
- [ ] Grammar
- [ ] Snapshot tests
- [ ] Agreement test

## Progress

Not started.
