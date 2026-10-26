---
id: 43
title: "SP4: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M1
sprint: SP4
created: 2026-10-25
---

End-of-sprint audit for SP4, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [ ] `.ai/audits/SP4-audit.md` exists, written by an Opus agent that wrote none of SP4's code, over the modules SP4 changed
- [ ] Every finding is a `type: bug` card in SP5 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [ ] The report ends with a "Cards" section listing those tickets

## Tasks

- [ ] Run the audit once the sprint's task cards are done
- [ ] Write the bugfix cards
- [ ] List them in the report and in Progress

## Progress

Audit `.ai/audits/SP4-audit.md`: 11 findings (1 must, 5 should, 5 nice). Cards in SP5: GCP-88 (P0), GCP-89, GCP-90, GCP-91, PLT-189, GCP-92 (P1), GCP-93, PLT-190, PLT-191, GCP-94, GCP-95 (P2).
