---
id: 39
title: "Show diagnostics and flags, and the lazy G-code text pane"
type: feature
priority: P0
effort: M
model: sonnet
area: [editor]
story: US13
milestone: "VSS:M1"
depends_on: [36, 14]
created: 2026-10-25
---

Zero silent failures: every E3 diagnostic and E4 flag is visible.

## Acceptance criteria

- [ ] All E3 diagnostics with 'go to offset' and E4 flags (assumed limits, estimate, invisible macros) appear in the panel (test per flag)
- [ ] The text pane reads lines from disk by file offset around the current move (test with a 500 MB-class synthetic file does not read the whole file)

## Tasks

- [ ] Diagnostics list
- [ ] Flag banner
- [ ] Offset reader pane

## Progress

Not started.
