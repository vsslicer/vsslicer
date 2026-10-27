---
id: 42
title: "SP3: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M1
sprint: SP3
created: 2026-10-25
---

End-of-sprint audit for SP3, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [x] `.ai/audits/SP3-audit.md` exists, written by an Opus agent that wrote none of SP3's code, over the modules SP3 changed
- [x] Every finding is a `type: bug` card in SP4 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [x] The report ends with a "Cards" section listing those tickets

## Tasks

- [x] Run the audit once the sprint's task cards are done
- [x] Write the bugfix cards
- [x] List them in the report and in Progress

## Progress

Audit by a fresh Opus agent at 95c8008 (38e4938..95c8008): no must-fix, 3 should-fix. SP2 fixes hold. Cards in SP4: GCP-85, PLT-187, GCP-86 (all P1, sonnet).
