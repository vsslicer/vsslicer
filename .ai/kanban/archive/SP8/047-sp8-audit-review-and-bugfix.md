---
id: 47
title: "SP8: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M2
sprint: SP8
created: 2026-10-25
---

End-of-sprint audit for SP8, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [ ] `.ai/audits/SP8-audit.md` exists, written by an Opus agent that wrote none of SP8's code, over the modules SP8 changed
- [ ] Every finding is a `type: bug` card in SP9 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [ ] The report ends with a "Cards" section listing those tickets

## Tasks

- [ ] Run the audit once the sprint's task cards are done
- [ ] Write the bugfix cards
- [ ] List them in the report and in Progress

## Progress

- 2026-10-26 sp8-auditor: `.ai/audits/SP8-audit.md` written (probe-based, 35 min). 10 findings: 1 must fix (3mf
  `startTags`/`scanModel` nesting is quadratic: a 741 B 3MF costs 17 s), 4 should fix, 5 nice to have; PRF-180 holds.
  Cards table left TBD for the coordinator; this card was not moved.

- Coordinator (09:12): bug cards in SP9 from the audit's 10 findings (12 cards, every one sonnet): P0 VWR-394; P1 PRF-185, SLC-277, VWR-395, GCP-115, PRF-186, PRF-187; P2 PRN-443, SLC-278, PLT-195, PRF-188, PRF-189. Also PRF-184 (P1, SP9) from PRF-11's oracle. Recorded in the report's Cards table.
