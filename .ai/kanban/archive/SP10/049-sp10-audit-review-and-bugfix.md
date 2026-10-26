---
id: 49
title: "SP10: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M2
sprint: SP10
created: 2026-10-25
---

End-of-sprint audit for SP10, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [ ] `.ai/audits/SP10-audit.md` exists, written by an Opus agent that wrote none of SP10's code, over the modules SP10 changed
- [ ] Every finding is a `type: bug` card in SP11 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [ ] The report ends with a "Cards" section listing those tickets

## Tasks

- [ ] Run the audit once the sprint's task cards are done
- [ ] Write the bugfix cards
- [ ] List them in the report and in Progress

## Progress

Audit `.ai/audits/SP10-audit.md` (fresh Opus agent, 12:44 to 13:00): 1 must fix, 6 should fix, 7 nice to have; SP9's fixes hold except SLC-279's symlink case. Bugfix cards in SP11: PRF-202 (P0, opus); PRF-203, PRN-446 (opus), PRF-204, PRF-205, PRF-206, PRF-207 (P1); PRF-208, PRF-209, PRF-210, PRN-447, SLC-281, VWR-398, PLT-203 (P2). SP9 bugs GCP-118, PRF-195, PRF-196, PRF-198 moved back to SP11.
