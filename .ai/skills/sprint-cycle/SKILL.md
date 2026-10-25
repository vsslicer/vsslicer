---
name: sprint-cycle
description: How a VSSlicer sprint runs from start to close, ending with an automatic audit whose findings become the next sprint's bugfix cards. Use when coordinating, finishing or closing a sprint, or starting the next one.
---

# Sprint cycle

One coordinator (Opus) runs one sprint. The board is the taskboard skill
(`~/.claude/skills/taskboard/SKILL.md`); pass `--agent <name>` to every `board.py` call.

1. **Finish the sprint's tasks.** Every card with `sprint: VSS:SP<n>` (or `SP<n>` on the VSS board),
   including the bugfix cards the previous sprint's audit created. Work them in dependency order,
   each on the model its card names, with independent verification and one commit per card.
   Cards blocked only on an owner answer may carry over; nothing else does.
2. **Run the audit.** When every task card is done or blocked, dispatch a fresh Opus agent that wrote
   none of this sprint's code. It runs `/ponytail:ponytail-audit` over the modules the sprint
   changed (`git diff --stat <sprint's first commit>..HEAD -- vsslicer/`) and saves the report as
   `.ai/audits/SP<n>-audit.md`. The audit changes no code. A sprint that changed no code still gets
   a one-line report saying so.
3. **Create the bugfix cards.** Each finding becomes a `type: bug` card on the board of the module
   it's in, in the next sprint (`sprint=VSS:SP<n+1>`), linking the report (`docs=`), with
   `model=sonnet` unless the fix needs design judgment:
   - must fix: `priority=P0`
   - should fix: `priority=P1`
   - nice to have: `priority=P2`
   Record the card tickets in the report under a closing "Cards" section, and in the
   "SP<n>: audit review and bugfix" card's Progress, then move that card to Done.
4. **Close and begin.** `board.py close-sprint SP<n> --next SP<n+1>`. It refuses until
   `.ai/audits/SP<n>-audit.md` exists (board.json `sprint_close.requires`), carries unfinished cards
   over, archives the finished ones and starts SP<n+1>. Commit it as `Board: close SP<n>`. Reply
   with the result; whoever started you then starts the coordinator for SP<n+1>.

## Traps

- The audit is step 2, not a background task. Start it only when the sprint's code is final, or it
  audits code that changes after.
- Bugfix cards go to the next sprint even when they look small. The current sprint closes on time;
  its fixes are the next sprint's first work, ahead of its planned cards (priority P0 sorts first).
- Commit only your own paths (`git commit -m ... -- <paths>`): other coordinators may share the checkout.
