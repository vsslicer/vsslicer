---
id: 46
title: "SP7: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M2
sprint: SP7
created: 2026-10-25
---

End-of-sprint audit for SP7, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [x] `.ai/audits/SP7-audit.md` exists, written by an Opus agent that wrote none of SP7's code, over the modules SP7 changed
- [x] Every finding is a `type: bug` card in SP8 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [x] The report ends with a "Cards" section listing those tickets

## Tasks

- [x] Run the audit once the sprint's task cards are done
- [x] Write the bugfix cards
- [x] List them in the report and in Progress

## Progress

2026-10-26 sp7-auditor: `.ai/audits/SP7-audit.md` written. SP6 findings 1-8 hold (PRF-179 licence field still open under Q20). One finding: PRF-180 (P2, profile-api bundle manifest encoded on every parse). No must-fix or should-fix findings; reading audit only, no probes (see Not checked).
