---
id: US54
title: "History never loses a line: two windows share one writer and damaged lines are skipped"
status: reviewed
epic: VSS:E46
---

As a user with two VS Code windows open, I want one writer for all windows and a history that tolerates damage, so that a crash, a second window or a half-written line never loses or corrupts my records.

## Acceptance criteria

- [ ] Two-window test: sends from both windows land in one file through the agent with no interleaved partial lines
- [ ] The file is append-only with fsync; nothing rewrites it in place
- [ ] A corrupt line is skipped with a warning and never truncates the file (test)
- [ ] With no agent (useAgent off) the in-process path writes the same file

## Out of scope

- Cloud sync of the history.
- Rotation or deletion of old months.
