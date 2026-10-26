---
id: 48
title: "SP9: audit review and bugfix"
type: chore
priority: P0
effort: S
model: opus
milestone: M2
sprint: SP9
created: 2026-10-25
---

End-of-sprint audit for SP9, steps 2 and 3 of `.ai/skills/sprint-cycle`.

## Acceptance criteria

- [ ] `.ai/audits/SP9-audit.md` exists, written by an Opus agent that wrote none of SP9's code, over the modules SP9 changed
- [ ] Every finding is a `type: bug` card in SP10 on its module's board (P0 must fix, P1 should fix, P2 nice to have), linking the report
- [ ] The report ends with a "Cards" section listing those tickets

## Tasks

- [ ] Run the audit once the sprint's task cards are done
- [ ] Write the bugfix cards
- [ ] List them in the report and in Progress

## Progress

Not started.
- 2026-10-26 sp9-auditor: audit written to `.ai/audits/SP9-audit.md`: SP8 fixes hold; 0 must fix, 4 should fix, 7 nice to have. Cards section left for the coordinator.

**Cards (sp9-coordinator):** audit `.ai/audits/SP9-audit.md`: no must-fix, 4 should-fix (finding 4 split per board), 7 nice-to-have. SP10 bug cards: PRF-194, GCP-118, PRF-195, GCP-119, VWR-396 (P1); PLT-198, VWR-397, SLC-279, SLC-280, PRF-196, PRF-197, PRF-198 (P2).
