---
id: 50
title: "SP11: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M2
sprint: SP11
created: 2026-10-25
---

End-of-sprint audit for SP11, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [ ] `.ai/audits/SP11-audit.md` exists, written by an Opus agent that wrote none of SP11's code, over the modules SP11 changed
- [ ] Every finding is a `type: bug` card in SP12 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [ ] The report ends with a "Cards" section listing those tickets

## Tasks

- [ ] Run the audit once the sprint's task cards are done
- [ ] Write the bugfix cards
- [ ] List them in the report and in Progress

## Progress

Not started.

- sp11-auditor wrote `.ai/audits/SP11-audit.md` (15 findings: 4 must, 7 should, 4 nice). sp11-coordinator made the SP12 bug cards: VWR-400, PRF-212, PRF-213, PRF-214 (P0); VWR-401, PRF-215, VWR-402, VWR-403, VWR-404, PRF-216, SLC-282, GCP-124 (existing) (P1); VWR-405, GCP-125, PRF-217, VWR-406 (P2).
