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
sprint: "VSS:SP7"
depends_on: [36, 14]
created: 2026-10-25
---

Zero silent failures: every E3 diagnostic and E4 flag is visible.

## Acceptance criteria

- [ ] All E3 diagnostics with 'go to offset' and E4 flags (assumed limits, estimate, invisible macros) appear in the panel (test per flag)
- [ ] The text pane reads lines from disk by file offset around the current move (test with a 500 MB-class synthetic file does not read the whole file)
- [ ] Bounds (rule 25): the text pane reads at most 64 KiB around the current offset per request and at most 400 lines; lines are clipped to 4 KiB; the panel lists at most 10,000 diagnostics with a count of the rest
- [ ] Hostile test: a synthetic file with a 10 MB single line and 100,000 diagnostics stays within those bounds

## Tasks

- [ ] Diagnostics list
- [ ] Flag banner
- [ ] Offset reader pane

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-36 (moved to SP6).
