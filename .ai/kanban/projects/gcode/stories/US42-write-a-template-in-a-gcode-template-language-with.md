---
id: US42
title: "Write a template in a gcode-template language with highlighting for placeholders and conditions"
status: reviewed
epic: VSS:E50
---

As a user, I want `[var]`, `{expression}`, `{if}`/`{elsif}`/`{else}`/`{endif}` and indexed vectors highlighted inside G-code templates, on top of the G-code grammar, so that I can read a long start script.

## Acceptance criteria

- [ ] A `gcode-template` language and TextMate grammar highlight placeholders, expressions, conditions and indexed vectors over the G-code grammar (snapshot tests on start, layer-change and tool-change templates from both slicers)
- [ ] A tokenizer in the library yields the same token boundaries as the grammar for the fixtures, so completion and hover agree with the highlighting

## Out of scope

- Evaluating or rendering a template; a preview of the output.
