---
id: 63
title: "Tokenise templates into placeholders, expressions and conditions"
type: feature
priority: P2
effort: M
model: sonnet
area: [language]
story: US42
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [59]
created: 2026-10-25
---

Pure tokenizer over template text: `[name]`, `[name[index]]`, `{expression}` with the identifiers it contains, `{if}`/`{elsif}`/`{else}`/`{endif}`, comments and plain G-code, with offsets, tolerant of unterminated input.

**Code:** `vsslicer/modules/core/gcode-templates/src/domain/...` (module: `gcode-templates`, layer: `domain`)

## Acceptance criteria

- [ ] Examples from real start G-code of both slicers tokenise as expected (table test); nested braces and quoted strings inside expressions do not end the expression early
- [ ] Property test: tokens cover the whole input without gaps or overlap for random inputs, and unterminated constructs yield an error token, never a throw

## Tasks

- [ ] Token types
- [ ] Scanner
- [ ] Property tests

## Progress

Not started.
